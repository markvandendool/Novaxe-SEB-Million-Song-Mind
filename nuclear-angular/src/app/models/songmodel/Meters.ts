// Angular 20 Compatible Meter Definitions
export const METERS_ARRAY = ['4/4', '3/4', '2/4', '6/8', '12/8', '9/8', '5/4', '7/8'];

export const METERS = {
    '4/4': { beats: 4, noteValue: 4, strong: [1, 3], weak: [2, 4] },
    '3/4': { beats: 3, noteValue: 4, strong: [1], weak: [2, 3] },
    '2/4': { beats: 2, noteValue: 4, strong: [1], weak: [2] },
    '6/8': { beats: 6, noteValue: 8, strong: [1, 4], weak: [2, 3, 5, 6] },
    '12/8': { beats: 12, noteValue: 8, strong: [1, 4, 7, 10], weak: [2, 3, 5, 6, 8, 9, 11, 12] },
    '9/8': { beats: 9, noteValue: 8, strong: [1, 4, 7], weak: [2, 3, 5, 6, 8, 9] },
    '5/4': { beats: 5, noteValue: 4, strong: [1, 3], weak: [2, 4, 5] },
    '7/8': { beats: 7, noteValue: 8, strong: [1, 3, 5], weak: [2, 4, 6, 7] }
}; export const NB_BEATS = {
    '4/4': 4,
    '3/4': 3,
    '2/4': 2,
    '6/8': 6,
    '12/8': 12,
    '9/8': 9,
    '5/4': 5,
    '7/8': 7
};
