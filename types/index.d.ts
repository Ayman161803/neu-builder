declare function _exports(options: PackagerOptions): Promise<STATUS> | Promise<STATUS>;
export = _exports;
export type Package = {
    name: string;
    description: string;
    developer: string;
    icon: string;
    license: string;
    dist: string;
};
export type Misc = {
    minifyConfig: boolean;
};
export type Platform = {
    windows: {
        x86_64: boolean;
        i386: boolean;
    };
    macos: boolean;
    linux: {
        x86_64: boolean;
        i386: boolean;
        armhf: boolean;
        arm64: boolean;
    };
};
export type Formats = {
    zip: boolean;
    tar: boolean;
    sevenZ: boolean;
};
export type PackagerOptions = {
    package: Package;
    misc: Misc;
    platform: Platform;
    formats: Formats;
};
export type STATUS_CODE = {
    SUCCESS: number;
    FILE_NOT_FOUND: number;
    ARCHIVING_ERR: number;
    DIR_NOT_EMPTY: number;
};
export type STATUS = {
    code: STATUS_CODE;
    text: string;
};
declare const STATUS_CODE: STATUS_CODE;
