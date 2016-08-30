DocFX Flavored Markdown Preview
==========================================

[![Current Version](http://vsmarketplacebadge.apphb.com/version/928pjy.DfmPreview.svg)](http://marketplace.visualstudio.com/items?itemName=928pjy.DfmPreview)
[![Install Count](http://vsmarketplacebadge.apphb.com/installs/928pjy.DfmPreview.svg)](https://marketplace.visualstudio.com/items?itemName=928pjy.DfmPreview)
[![Open Issues](http://vsmarketplacebadge.apphb.com/rating/928pjy.DfmPreview.svg) ](https://marketplace.visualstudio.com/items?itemName=928pjy.DfmPreview)

An extension to support **Dfm** for Visual Studio Code! The preview providers the following features and more:

* Preview the `Dfm` to the side
* Preview the `TokenTree` to the side
* Match the markdown file the tokenTree node
* Match the tokenTree node to the markdown file

## Quick Start
* Install the extension
> **Notice:** Upgrade to Visual Studio Code 1.3.0 or above.
* open a markdown file which can include dfm syntax
* use the `Preview` and `TokenTree`
> **Notice:** If you want to use Dfm feature `File include` and `Code Snippets`, You have to open a folder which include your target markdown file

## Document
For further information and detail about DocFX Flavored Markdown, please reference [DocFX Flavored Markdown](https://dotnet.github.io/docfx/spec/docfx_flavored_markdown.html)

## Feature Details
- Live preview  
  The shortcuts are
    - `ctrl+shift+q`    Preview
    - `ctrl+k q`        Preview to side  

  The Command title are(hit `F1` to input command title)
    - `Toggle Dfm Preview`              Preview
    - `Open Dfm Preview to the side`    Preview to side
  
  ![PreviewToside](img/previewToSide.gif)

- Token tree
  - The shortcuts are
    - `ctrl+shift+t`    TokenTreeToSide 

  - The Command title are(hit `F1` to input command title)
    - `Open Dfm Preview to the side`   TokenTreeToSide

  - Expand and collapse the node by hit the circle of node

  - Display the detail information of node on mouseover

  ![Match](img/TokenTree.gif)

- Match between markdown file with tokenTree Node
  - click/select the text you want to match to the tokenTree
    > You can select multiple lines.
  - click the text of node to match to the markdown file

  ![Match](img/Match.gif)

## Found a Bug?
Please file any issue through the [Github Issue](https://github.com/dotnet/docfx/issues) system.

## Development
### First install
* Visual Studio Code(new than 1.3.0)
* Node.js(Npm included)

### To run and develop do the following：
* Run  `npm install` under the root dir of this extension
* Open in Visual Studio Code(run `code .` under the root dir of this extension)
> Cannot find module 'vscode'? Run `npm run postinstall` under the root dir of this extension, according to [Cannot find module 'vscode' – where is vscode.d.ts now installed? #2810](https://github.com/Microsoft/vscode/issues/2810)
* Press `F5` to debug

## Source
[docfx/src/VscPreviewExtension](https://github.com/dotnet/docfx/tree/dev/src/VscPreviewExtension)

## Licences
*DocFX* is licensed under the [MIT license](LICENSE).

## Change Log
### Current Version **0.0.11**
* **0.0.11**
  * Add feature: tokenTree preview
* **0.0.10**
  * Bug fix: can't toggle the default markdown preview after dfmPreview
* **0.0.9**
  * Bug fix: can't preview a single file(not in a open folder)
  * Bug fix: throw an error if it is not a markdown file
*  **0.0.8**
  * Bug fix: open other preview window
  * Bug fix: some css and JavaScript files to show the html
* **0.0.7**
  * Initial Release!

## TODO
* Support Dfm feature `YamlHeader`
* Support Dfm feature `Cross Reference`
* Match between markdown file with preview
* Auto trigger the tokenTree refresh when the textEditor change
* `Cross-platform`
* User configurable