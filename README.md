## The Battle Cats information website

### Build from source

1. Clone [build scripts](https://github.com/battlecatsinfo/battlecats-scripts)
2. Clone [source code of this website](https://github.com/battlecatsinfo/battlecatsinfo-source)
3. Make sure you have installed [BCU](https://github.com/battlecatsultimate/BCU-java-PC) and update to lastest version
4. Extract BCU's org folder to battlecats-scripts
5. Copy BCU's `assets` folder to battlecats-scripts
6. Make a folder named `battlecatsinfo.github.io`

  parent/battlecatsinfo.github.io/
  parent/battlecats-scripts

7. Run makefile

```bash
$ make all
$ make update
```
8. Build source code of this website and copy to `battlecatsinfo.github.io` folder
