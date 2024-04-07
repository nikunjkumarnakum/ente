import { haveWindow } from "@/next/env";

import localForage from "localforage";

if (haveWindow()) {
    localForage.config({
        name: "ente-files",
        version: 1.0,
        storeName: "files",
    });
}

export default localForage;
