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

    "moduleDirectories": ["node_modules", "."],
    
    //testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
    //moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],

    //"collectCoverage": true,
    //"collectCoverageFrom": [  
    //  "ts/**/*.ts"
    //],

    "globals": {
        "ts-jest": {
            "tsconfig": "tsconfig.json"
        }
    }
}
