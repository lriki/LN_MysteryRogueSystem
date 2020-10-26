module.exports = {
    "roots": [
        "<rootDir>"
    ],
    "testMatch": [
        "**/__tests__/**/*.+(ts|tsx|js)",
        "**/?(*.)+(spec|test).+(ts|tsx|js)"
    ],
    "transform": {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
    "moduleNameMapper": {
        "^ts/(.*)": "<rootDir>/ts/$1"
    },
    "globals": {
        "ts-jest": {
            "tsconfig": "tsconfig.json"
        }
    }
}
