// Type declarations for StaticElements.js
// Describes the exported `animalsJson` array so TypeScript can type-check imports.

export interface Animal {
    name: string;
    description?: string;
    reward?: boolean;
    particular_signs?: string[];
    last_seen_place?: string;
    photo?: string;
}

export const animalsJson: Animal[];

export { }
