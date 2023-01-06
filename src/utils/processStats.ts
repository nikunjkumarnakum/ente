import ElectronLog from 'electron-log';
import { webFrame } from 'electron/renderer';

const LOGGING_INTERVAL_IN_MICROSECONDS = 30 * 1000; // 30 seconds

const SPIKE_DETECTION_INTERVAL_IN_MICROSECONDS = 1 * 1000; // 1 seconds

const HIGH_MEMORY_USAGE_THRESHOLD_IN_KILOBYTES = 1 * 1024 * 1024; // 1 GB

const LOW_MEMORY_FREE_THRESHOLD_IN_KILOBYTES = 1 * 1024 * 1024; // 1 GB

async function logMainProcessStats() {
    const processMemoryInfo = await process.getProcessMemoryInfo();
    const normalizedProcessMemoryInfo = await getNormalizedProcessMemoryInfo(
        processMemoryInfo
    );
    const systemMemoryInfo = process.getSystemMemoryInfo();
    const normalizedSystemMemoryInfo =
        getNormalizedSystemMemoryInfo(systemMemoryInfo);
    const cpuUsage = process.getCPUUsage();
    const heapStatistics = getNormalizedHeapStatistics();

    ElectronLog.log('main process stats', {
        processMemoryInfo: normalizedProcessMemoryInfo,
        systemMemoryInfo: normalizedSystemMemoryInfo,
        heapStatistics,
        cpuUsage,
    });
}

async function logSpikeMemoryUsage() {
    const processMemoryInfo = await process.getProcessMemoryInfo();
    const systemMemoryInfo = process.getSystemMemoryInfo();
    if (
        processMemoryInfo.residentSet >
            HIGH_MEMORY_USAGE_THRESHOLD_IN_KILOBYTES ||
        systemMemoryInfo.free < LOW_MEMORY_FREE_THRESHOLD_IN_KILOBYTES
    ) {
        const normalizedProcessMemoryInfo =
            await getNormalizedProcessMemoryInfo(processMemoryInfo);
        const normalizedSystemMemoryInfo =
            getNormalizedSystemMemoryInfo(systemMemoryInfo);
        const cpuUsage = process.getCPUUsage();
        const heapStatistics = getNormalizedHeapStatistics();

        ElectronLog.log('main process stats', {
            processMemoryInfo: normalizedProcessMemoryInfo,
            systemMemoryInfo: normalizedSystemMemoryInfo,
            heapStatistics,
            cpuUsage,
        });
    }
}

async function logRendererProcessStats() {
    const blinkMemoryInfo = getNormalizedBlinkMemoryInfo();
    const heapStatistics = process.getHeapStatistics();
    const webFrameResourceUsage = webFrame.getResourceUsage();
    ElectronLog.log('renderer process stats', {
        blinkMemoryInfo,
        heapStatistics,
        webFrameResourceUsage,
    });
}

export function setupMainProcessStatsLogger() {
    setInterval(logSpikeMemoryUsage, SPIKE_DETECTION_INTERVAL_IN_MICROSECONDS);
    setInterval(logMainProcessStats, LOGGING_INTERVAL_IN_MICROSECONDS);
}

export function setupRendererProcessStatsLogger() {
    setInterval(logRendererProcessStats, LOGGING_INTERVAL_IN_MICROSECONDS);
}

const getNormalizedProcessMemoryInfo = async (
    processMemoryInfo: Electron.ProcessMemoryInfo
) => {
    return {
        residentSet: convertBytesToHumanReadable(
            processMemoryInfo.residentSet * 1024
        ),
        private: convertBytesToHumanReadable(processMemoryInfo.private * 10124),
        shared: convertBytesToHumanReadable(processMemoryInfo.shared * 1024),
    };
};

const getNormalizedSystemMemoryInfo = (
    systemMemoryInfo: Electron.SystemMemoryInfo
) => {
    return {
        total: convertBytesToHumanReadable(systemMemoryInfo.total * 1024),
        free: convertBytesToHumanReadable(systemMemoryInfo.free * 1024),
        swapTotal: convertBytesToHumanReadable(
            systemMemoryInfo.swapTotal * 1024
        ),
        swapFree: convertBytesToHumanReadable(systemMemoryInfo.swapFree * 1024),
    };
};

const getNormalizedBlinkMemoryInfo = () => {
    const blinkMemoryInfo = process.getBlinkMemoryInfo();
    return {
        allocated: convertBytesToHumanReadable(
            blinkMemoryInfo.allocated * 1024
        ),
        total: convertBytesToHumanReadable(blinkMemoryInfo.total),
    };
};

const getNormalizedHeapStatistics = () => {
    const heapStatistics = process.getHeapStatistics();
    return {
        totalHeapSize: convertBytesToHumanReadable(
            heapStatistics.totalHeapSize * 1024
        ),
        totalHeapSizeExecutable: convertBytesToHumanReadable(
            heapStatistics.totalHeapSizeExecutable * 1024
        ),
        totalPhysicalSize: convertBytesToHumanReadable(
            heapStatistics.totalPhysicalSize * 1024
        ),
        totalAvailableSize: convertBytesToHumanReadable(
            heapStatistics.totalAvailableSize * 1024
        ),
        usedHeapSize: convertBytesToHumanReadable(
            heapStatistics.usedHeapSize * 1024
        ),

        heapSizeLimit: convertBytesToHumanReadable(
            heapStatistics.heapSizeLimit * 1024
        ),
        mallocedMemory: convertBytesToHumanReadable(
            heapStatistics.mallocedMemory * 1024
        ),
        peakMallocedMemory: convertBytesToHumanReadable(
            heapStatistics.peakMallocedMemory * 1024
        ),
        doesZapGarbage: heapStatistics.doesZapGarbage,
    };
};

function convertBytesToHumanReadable(bytes: number, precision = 2): string {
    if (bytes === 0 || isNaN(bytes)) {
        return '0 MB';
    }

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    return (bytes / Math.pow(1024, i)).toFixed(precision) + ' ' + sizes[i];
}
