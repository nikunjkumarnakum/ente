import { type Metadata, ItemVisibility } from "@/media/file-metadata";

export interface MetadataFileAttributes {
    encryptedData: string;
    decryptionHeader: string;
}
export interface S3FileAttributes {
    objectKey: string;
    decryptionHeader: string;
}

export interface FileInfo {
    fileSize: number;
    thumbSize: number;
}

export interface MagicMetadataCore<T> {
    version: number;
    count: number;
    header: string;
    data: T;
}

export type EncryptedMagicMetadata = MagicMetadataCore<string>;

export interface EncryptedEnteFile {
    id: number;
    collectionID: number;
    ownerID: number;
    file: S3FileAttributes;
    thumbnail: S3FileAttributes;
    metadata: MetadataFileAttributes;
    info: FileInfo | undefined;
    magicMetadata: EncryptedMagicMetadata;
    pubMagicMetadata: EncryptedMagicMetadata;
    encryptedKey: string;
    keyDecryptionNonce: string;
    isDeleted: boolean;
    updationTime: number;
}

// TODO: Move into media
export interface EnteFile
    extends Omit<
        EncryptedEnteFile,
        | "metadata"
        | "pubMagicMetadata"
        | "magicMetadata"
        | "encryptedKey"
        | "keyDecryptionNonce"
    > {
    metadata: Metadata;
    magicMetadata: FileMagicMetadata;
    /**
     * The envelope containing the public magic metadata associated with this
     * file.
     *
     * In almost all cases, files will have associated public magic metadata
     * since newer clients have something or the other they need to add to it.
     * But its presence is not guaranteed.
     */
    pubMagicMetadata?: FilePublicMagicMetadata;
    isTrashed?: boolean;
    /**
     * The base64 encoded encryption key associated with this file.
     *
     * This key is used to encrypt both the file's contents, and any associated
     * data (e.g., metadatum, thumbnail) for the file.
     */
    key: string;
    src?: string;
    srcURLs?: SourceURLs;
    msrc?: string;
    html?: string;
    w?: number;
    h?: number;
    title?: string;
    deleteBy?: number;
    isSourceLoaded?: boolean;
    conversionFailed?: boolean;
    isConverted?: boolean;
}

export interface LivePhotoSourceURL {
    image: () => Promise<string | undefined>;
    video: () => Promise<string | undefined>;
}

export interface LoadedLivePhotoSourceURL {
    image: string;
    video: string;
}

export interface SourceURLs {
    url: string | LivePhotoSourceURL | LoadedLivePhotoSourceURL;
    isOriginal: boolean;
    isRenderable: boolean;
    type: "normal" | "livePhoto";
    /**
     * Best effort attempt at obtaining the MIME type.
     *
     * Known cases where it is missing:
     *
     * - Live photos (these have a different code path for obtaining the URL).
     * - A video that is passes the isPlayable test in the browser.
     *
     */
    mimeType?: string;
}

export interface TrashRequest {
    items: TrashRequestItems[];
}

export interface TrashRequestItems {
    fileID: number;
    collectionID: number;
}

export interface FileWithUpdatedMagicMetadata {
    file: EnteFile;
    updatedMagicMetadata: FileMagicMetadata;
}

export interface FileWithUpdatedPublicMagicMetadata {
    file: EnteFile;
    updatedPublicMagicMetadata: FilePublicMagicMetadata;
}

export interface FileMagicMetadataProps {
    /**
     * The visibility of the file
     *
     * The file's visibility is user specific attribute, and thus we keep it in
     * the private magic metadata. This allows the file's owner to share a file
     * and edit its visibility without making revealing their visibility
     * preference to the people with whom they have shared the file.
     */
    visibility?: ItemVisibility;
    filePaths?: string[];
}

export type FileMagicMetadata = MagicMetadataCore<FileMagicMetadataProps>;

export interface FilePublicMagicMetadataProps {
    /**
     * Modified value of the date time associated with an {@link EnteFile}.
     *
     * Epoch microseconds.
     */
    editedTime?: number;
    /**
     * Edited name of the {@link EnteFile}.
     *
     * If the user edits the name of the file within Ente, then the edits are
     * saved in this field.
     */
    editedName?: string;
    /**
     * A arbitrary textual caption / description that the user has attached to
     * the {@link EnteFile}.
     */
    caption?: string;
    uploaderName?: string;
    /**
     * Width of the image / video, in pixels.
     */
    w?: number;
    /**
     * Height of the image / video, in pixels.
     */
    h?: number;
    /**
     * Edited latitude for the {@link EnteFile}.
     *
     * If the user edits the location (latitude and longitude) of a file within
     * Ente, then the edits will be stored as the {@link lat} and {@link long}
     * properties in the file's public magic metadata.
     */
    lat?: number;
    /**
     * Edited longitude for the {@link EnteFile}.
     *
     * See {@link long}.
     */
    long?: number;
}

export type FilePublicMagicMetadata =
    MagicMetadataCore<FilePublicMagicMetadataProps>;

export interface TrashItem extends Omit<EncryptedTrashItem, "file"> {
    file: EnteFile;
}

export interface EncryptedTrashItem {
    file: EncryptedEnteFile;
    isDeleted: boolean;
    isRestored: boolean;
    deleteBy: number;
    createdAt: number;
    updatedAt: number;
}

export type Trash = TrashItem[];
