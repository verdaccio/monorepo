# Flow/Typescript types for Verdaccio

Typescript / Flow definitions for verdaccio plugins and internal code

# Typescript
For usage with the library, the `tsconfig.json` should looks like this. Typescript is only available since `"@verdaccio/types": "5.0.0-beta.2"`.

```
//tsconfig.json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "commonjs",
    "declaration": true,
    "noImplicitAny": false,
    "strict": true,
    "outDir": "lib",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "typeRoots": [
      "./node_modules/@verdaccio/types/lib/verdaccio",
      "./node_modules/@types"
    ]
  },
  "include": [
    "src/*.ts",
    "types/*.d.ts"
  ]
}
```

# Flow 

## Usage

To set up the types we need to add them to the `.flowconfig` flow configuration file.

```
[libs]
node_modules/@verdaccio/types/lib/

[options]
suppress_comment= \\(.\\|\n\\)*\\$FlowFixMe
```

### Imports

```
import type {ILocalData, LocalStorage, Logger, Config} from '@verdaccio/types';

 class LocalData implements ILocalData {

  path: string;
  logger: Logger;
  data: LocalStorage;
  config: Config;
  locked: boolean;
  ...  
}
```


