import { stashRedirect } from "@/accounts/services/redirect";
import { ActivityIndicator } from "@/base/components/mui/ActivityIndicator";
import { errorDialogAttributes } from "@/base/components/utils/dialog";
import log from "@/base/log";
import { ALL_SECTION, moveToTrash } from "@/new/photos/services/collection";
import { getLocalCollections } from "@/new/photos/services/collections";
import {
    createFileCollectionIDs,
    getLocalFiles,
} from "@/new/photos/services/files";
import { useAppContext } from "@/new/photos/types/context";
import { VerticallyCentered } from "@ente/shared/components/Container";
import { PHOTOS_PAGES as PAGES } from "@ente/shared/constants/pages";
import { ApiError } from "@ente/shared/error";
import useMemoSingleThreaded from "@ente/shared/hooks/useMemoSingleThreaded";
import { SESSION_KEYS, getKey } from "@ente/shared/storage/sessionStorage";
import { styled } from "@mui/material";
import Typography from "@mui/material/Typography";
import { HttpStatusCode } from "axios";
import DeduplicateOptions from "components/pages/dedupe/SelectedFileOptions";
import PhotoFrame from "components/PhotoFrame";
import { t } from "i18next";
import { default as Router, default as router } from "next/router";
import { createContext, useEffect, useState } from "react";
import { getAllLatestCollections } from "services/collectionService";
import { Duplicate, getDuplicates } from "services/deduplicationService";
import { syncFiles } from "services/fileService";
import { syncTrash } from "services/trashService";
import { SelectedState } from "types/gallery";
import { getSelectedFiles } from "utils/file";

export interface DeduplicateContextType {
    isOnDeduplicatePage: boolean;
    collectionNameMap: Map<number, string>;
}

export const DeduplicateContext = createContext<DeduplicateContextType>({
    isOnDeduplicatePage: false,
    collectionNameMap: new Map<number, string>(),
});

export const Info = styled("div")`
    padding: 24px;
    font-size: 18px;
`;

export default function Deduplicate() {
    const { showNavBar, showLoadingBar, hideLoadingBar, showMiniDialog } =
        useAppContext();
    const [duplicates, setDuplicates] = useState<Duplicate[]>(null);
    const [collectionNameMap, setCollectionNameMap] = useState(
        new Map<number, string>(),
    );
    const [selected, setSelected] = useState<SelectedState>({
        count: 0,
        collectionID: 0,
        ownCount: 0,
        context: undefined,
    });
    const closeDeduplication = function () {
        Router.push(PAGES.GALLERY);
    };
    useEffect(() => {
        const key = getKey(SESSION_KEYS.ENCRYPTION_KEY);
        if (!key) {
            stashRedirect(PAGES.DEDUPLICATE);
            router.push("/");
            return;
        }
        showNavBar(true);
    }, []);

    useEffect(() => {
        syncWithRemote();
    }, []);

    const syncWithRemote = async () => {
        showLoadingBar();
        try {
            const collections = await getLocalCollections();
            const collectionNameMap = new Map<number, string>();
            for (const collection of collections) {
                collectionNameMap.set(collection.id, collection.name);
            }
            setCollectionNameMap(collectionNameMap);
            const files = await getLocalFiles();
            const duplicateFiles = await getDuplicates(
                files,
                collectionNameMap,
            );
            const currFileSizeMap = new Map<number, number>();
            let toSelectFileIDs: number[] = [];
            let count = 0;
            for (const dupe of duplicateFiles) {
                // select all except first file
                toSelectFileIDs = [
                    ...toSelectFileIDs,
                    ...dupe.files.slice(1).map((f) => f.id),
                ];
                count += dupe.files.length - 1;

                for (const file of dupe.files) {
                    currFileSizeMap.set(file.id, dupe.size);
                }
            }
            setDuplicates(duplicateFiles);
            const selectedFiles = {
                count: count,
                ownCount: count,
                collectionID: ALL_SECTION,
                context: undefined,
            };
            for (const fileID of toSelectFileIDs) {
                selectedFiles[fileID] = true;
            }
            setSelected(selectedFiles);
        } finally {
            hideLoadingBar();
        }
    };

    const duplicateFiles = useMemoSingleThreaded(() => {
        return (duplicates ?? []).reduce((acc, dupe) => {
            return [...acc, ...dupe.files];
        }, []);
    }, [duplicates]);

    const fileToCollectionsMap = useMemoSingleThreaded(() => {
        return createFileCollectionIDs(duplicateFiles ?? []);
    }, [duplicateFiles]);

    const deleteFileHelper = async () => {
        try {
            showLoadingBar();
            const selectedFiles = getSelectedFiles(selected, duplicateFiles);
            await moveToTrash(selectedFiles);

            // trashFiles above does an API request, we still need to update our
            // local state.
            //
            // Enhancement: This can be done in a more granular manner. Also, it
            // is better to funnel these syncs instead of adding these here and
            // there in an ad-hoc manner. For now, this fixes the issue with the
            // UI not updating if the user deletes only some of the duplicates.
            const collections = await getAllLatestCollections();
            await syncFiles(
                "normal",
                collections,
                () => {},
                () => {},
            );
            await syncTrash(collections, () => {});
            await syncWithRemote();
        } catch (e) {
            log.error("Dedup delete failed", e);
            await syncWithRemote();
            // See: [Note: Chained MiniDialogs]
            setTimeout(() => {
                showMiniDialog(
                    errorDialogAttributes(
                        e instanceof ApiError &&
                            e.httpStatusCode == HttpStatusCode.Forbidden
                            ? t("not_file_owner_delete_error")
                            : t("generic_error"),
                    ),
                );
            }, 0);
        } finally {
            hideLoadingBar();
        }
    };

    const clearSelection = function () {
        setSelected({
            count: 0,
            collectionID: 0,
            ownCount: 0,
            context: undefined,
        });
    };

    if (!duplicates) {
        return (
            <VerticallyCentered>
                <ActivityIndicator />
            </VerticallyCentered>
        );
    }

    return (
        <DeduplicateContext.Provider
            value={{
                collectionNameMap,
                isOnDeduplicatePage: true,
            }}
        >
            {duplicateFiles.length > 0 && (
                <Info>{t("DEDUPLICATE_BASED_ON_SIZE")}</Info>
            )}
            {duplicateFiles.length === 0 ? (
                <VerticallyCentered>
                    <Typography variant="large" color="text.muted">
                        {t("NO_DUPLICATES_FOUND")}
                    </Typography>
                </VerticallyCentered>
            ) : (
                <PhotoFrame
                    page={PAGES.DEDUPLICATE}
                    files={duplicateFiles}
                    duplicates={duplicates}
                    syncWithRemote={syncWithRemote}
                    setSelected={setSelected}
                    selected={selected}
                    activeCollectionID={ALL_SECTION}
                    fileToCollectionsMap={fileToCollectionsMap}
                    collectionNameMap={collectionNameMap}
                    selectable={true}
                />
            )}
            <DeduplicateOptions
                deleteFileHelper={deleteFileHelper}
                count={selected.count}
                close={closeDeduplication}
                clearSelection={clearSelection}
            />
        </DeduplicateContext.Provider>
    );
}
