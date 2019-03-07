#!/usr/bin/env node
const fs = require("fs");
///*** Default File paths */

var fileInPath = "input.css";
var fileOutPath = "output.ts";
const path = require("path");

var ToFunctions = true;
var AddImports = true;

var t0 = new Date();

let getNodeArguments = () => {
  try {
    // check paths in arguments
    let hasFileInOutArgs = process.argv.length === 4;
    if (!hasFileInOutArgs) {
      throw "arguments for file-in and file-out should be provided";
    }
    // normalize paths
    fileInPath = path.resolve(path.normalize(process.argv[2])).toString();
    fileOutPath = path.resolve(path.normalize(process.argv[3])).toString();
    // check paths for extensions
    let isFileInCss = fileInPath.endsWith(".css"),
      isFileOutJson = fileOutPath.endsWith(".json");
    if (!isFileInCss) {
      //throw "argument file-in must have extension .css";
    }
    if (!isFileOutJson) {
      //throw "argument file-out must have extension .json";
    }
  } catch (err) {
    console.error(err);
  }
};
getNodeArguments();

let helloMessage = `
Input file : ${fileInPath}
Output file : ${fileOutPath}
(note: output file will be overwritten if file already exists)
`
console.log(helloMessage);

// To JSON
function TryParseInt(str, defaultValue) {
  if (typeof str == "number") {
    return str;
  }
  var retValue = defaultValue;
  if (str !== null) {
    if (str.length > 0) {
      if (!isNaN(str)) {
        retValue = parseInt(str);
      }
    }
  }
  return retValue;
}

function CleanStr(str, light = true) {
  str = str.replace(/[\b\f\n\r\t\v\0]/g, "");
  if (!light) {
    str = str.replace(/\\b|\\f|\\n|\\r|\\t|\\v|\\0/g, "");

    str = str.replace(/\\\\b|\\\\f|\\\\n|\\\\r|\\\\t|\\v|\\\\0/g, "");
  }
  str = str.replace(/  /g, " ").replace(/  /g, " ");

  return str;
}
var CSSJSON = new function() {
  var base = this;

  base.init = function() {
    // String functions
    String.prototype.trim = function() {
      return this.replace(/^\s+|\s+$/g, "");
    };

    String.prototype.repeat = function(n) {
      return new Array(1 + n).join(this);
    };
  };
  base.init();

  var selX = /([^\s\;\{\}][^\;\{\}]*)\{/g;
  var endX = /\}/g;
  var lineX = /([^\;\{\}]*)\;/g;
  var commentX = /\/\*[\s\S]*?\*\//g;
  var lineAttrX = /([^\:]+):([^\;]*);/;

  // This is used, a concatenation of all above. We use alternation to
  // capture.
  var altX = /(\/\*[\s\S]*?\*\/)|([^\s\;\{\}][^\;\{\}]*(?=\{))|(\})|([^\;\{\}]+\;(?!\s*\*\/))/gim;

  //var altX = /(\/\*[\s\S]*?\*\/)|([^\s\;\{\}][^\;\{\}]*(?=\{))|(\})|([^\;\{\}]+[\;|\}](?!\s*\*\/))/gim
  // Capture groups
  var capComment = 1;
  var capSelector = 2;
  var capEnd = 3;
  var capAttr = 4;

  var isEmpty = function(x) {
    return typeof x == "undefined" || x.length == 0 || x == null;
  };

  var isCssJson = function(node) {
    return !isEmpty(node) ? node.attributes && node.children : false;
  };

  /**
   * Input is css string and current pos, returns JSON object
   *
   * @param cssString
   *            The CSS string.
   * @param args
   *            An optional argument object. ordered: Whether order of
   *            comments and other nodes should be kept in the output. This
   *            will return an object where all the keys are numbers and the
   *            values are objects containing "name" and "value" keys for each
   *            node. comments: Whether to capture comments. split: Whether to
   *            split each comma separated list of selectors.
   */
  base.toJSON = function(cssString, args) {
    var node = {
      children: {},
      attributes: {}
    };
    var match = null;
    var count = 0;

    if (typeof args == "undefined") {
      var args = {
        ordered: false,
        comments: false,
        stripComments: false,
        split: false
      };
    }
    if (args.stripComments) {
      args.comments = false;
      cssString = cssString.replace(commentX, "");
    }

    while ((match = altX.exec(cssString)) != null) {
      if (!isEmpty(match[capComment]) && args.comments) {
        // Comment
        var add = match[capComment].trim();
        node[count++] = add;
      } else if (!isEmpty(match[capSelector])) {
        // New node, we recurse
        var name = match[capSelector].trim();
        // This will return when we encounter a closing brace
        var newNode = base.toJSON(cssString, args);
        if (args.ordered) {
          var obj = {};
          obj["name"] = name;
          obj["value"] = newNode;
          // Since we must use key as index to keep order and not
          // name, this will differentiate between a Rule Node and an
          // Attribute, since both contain a name and value pair.
          obj["type"] = "rule";
          node[count++] = obj;
        } else {
          if (args.split) {
            var bits = name.split(",");
          } else {
            var bits = [name];
          }
          for (i in bits) {
            var sel = bits[i].trim();
            if (sel in node.children) {
              for (var att in newNode.attributes) {
                node.children[sel].attributes[att] = newNode.attributes[att];
              }
            } else {
              node.children[sel] = newNode;
            }
          }
        }
      } else if (!isEmpty(match[capEnd])) {
        // Node has finished
        return node;
      } else if (!isEmpty(match[capAttr])) {
        var line = match[capAttr].trim();
        var attr = lineAttrX.exec(line);
        if (attr) {
          // Attribute
          var name = attr[1].trim();
          var value = TryParseInt(attr[2].trim(), attr[2].trim()); //attr[2].trim();
          if (args.ordered) {
            var obj = {};
            obj["name"] = name;
            obj["value"] = value;
            obj["type"] = "attr";
            node[count++] = obj;
          } else {
            if (name in node.attributes) {
              var currVal = node.attributes[name];
              if (!(currVal instanceof Array)) {
                node.attributes[name] = [currVal];
              }
              node.attributes[name].push(value);
            } else {
              node.attributes[name] = value;
            }
          }
        } else {
          // Semicolon terminated line
          node[count++] = line;
        }
      }
    }

    return node;
  };

  /**
   * @param node
   *            A JSON node.
   * @param depth
   *            The depth of the current node; used for indentation and
   *            optional.
   * @param breaks
   *            Whether to add line breaks in the output.
   */
  base.toCSS = function(node, depth, breaks) {
    var cssString = "";
    if (typeof depth == "undefined") {
      depth = 0;
    }
    if (typeof breaks == "undefined") {
      breaks = false;
    }
    if (node.attributes) {
      for (i in node.attributes) {
        var att = node.attributes[i];
        if (att instanceof Array) {
          for (var j = 0; j < att.length; j++) {
            cssString += strAttr(i, att[j], depth);
          }
        } else {
          cssString += strAttr(i, att, depth);
        }
      }
    }
    if (node.children) {
      var first = true;
      for (i in node.children) {
        if (breaks && !first) {
          cssString += "\n";
        } else {
          first = false;
        }
        cssString += strNode(i, node.children[i], depth);
      }
    }
    return cssString;
  };

  /**
   * @param data
   *            You can pass css string or the CSSJS.toJSON return value.
   * @param id (Optional)
   *            To identify and easy removable of the style element
   * @param replace (Optional. defaults to TRUE)
   *            Whether to remove or simply do nothing
   * @return HTMLLinkElement
   */
  base.toHEAD = function(data, id, replace) {
    var head = document.getElementsByTagName("head")[0];
    var xnode = document.getElementById(id);
    var _xnodeTest = xnode !== null && xnode instanceof HTMLStyleElement;

    if (isEmpty(data) || !(head instanceof HTMLHeadElement)) return;
    if (_xnodeTest) {
      if (replace === true || isEmpty(replace)) {
        xnode.removeAttribute("id");
      } else return;
    }
    if (isCssJson(data)) {
      data = base.toCSS(data);
    }

    var node = document.createElement("style");
    node.type = "text/css";

    if (!isEmpty(id)) {
      node.id = id;
    } else {
      node.id = "cssjson_" + timestamp();
    }
    if (node.styleSheet) {
      node.styleSheet.cssText = data;
    } else {
      node.appendChild(document.createTextNode(data));
    }

    head.appendChild(node);

    if (isValidStyleNode(node)) {
      if (_xnodeTest) {
        xnode.parentNode.removeChild(xnode);
      }
    } else {
      node.parentNode.removeChild(node);
      if (_xnodeTest) {
        xnode.setAttribute("id", id);
        node = xnode;
      } else return;
    }

    return node;
  };

  // Alias

  if (typeof window != "undefined") {
    window.createCSS = base.toHEAD;
  }

  // Helpers

  var isValidStyleNode = function(node) {
    return node instanceof HTMLStyleElement && node.sheet.cssRules.length > 0;
  };

  var timestamp = function() {
    return Date.now() || +new Date();
  };

  var strAttr = function(name, value, depth) {
    return "\t".repeat(depth) + name + ": " + value + ";\n";
  };

  var strNode = function(name, value, depth) {
    var cssString = "\t".repeat(depth) + name + " {\n";
    cssString += base.toCSS(value, depth + 1);
    cssString += "\t".repeat(depth) + "}\n";
    return cssString;
  };
}();

// ==== Extract classes from css object
function JsonCssToClasses(str, obj = null) {
  var CSSObjectsArr = obj;
  if (!obj) {
    JSON.parse(str);
    str = CleanStr(str, true); //str.replace(/[\b\f\n\r\t\v\0]/g, "");
    CSSObjectsArr = JSON.parse(str);
  }

  var CSSObject = CSSObjectsArr.children;

  const CSSObjectEntreis = Object.entries(CSSObject);

  let ClassesArr = [];
  //loop through every selecor to Extract children
  //let Offsetkeyframes = [];
  for (var [CSSSelectorName, CSSSelectorValue] of CSSObjectEntreis) {
    //If it's not first livel selector
    if (typeof CSSSelectorName != "string") {
      continue;
    }

    CSSSelectorName = CSSSelectorName.trim();
    let hasClass = CSSSelectorName.match(/(?<=\.).*/g);
    let oneClass = !CSSSelectorName.match(/\./g)
      ? false
      : CSSSelectorName.match(/\./g).length == 1
      ? true
      : false;
    if (!oneClass) {
      continue;
    }
    //If its a single class
    //let WordRgex = /(?<=\.)((\w+[-]\w+)|(\w+))/g;

    let AnythinButClass = CSSSelectorName.match(/[\(\)\^\#\[\]\:\>\|\+\,]/g);

    if (
      //!CSSSelectorName.match(WordRgex)||
      AnythinButClass
    ) {
      continue;
    }
    //If Selector is class

    //look for children of object and seperate selector and value
    //const keyframeEntries = Object.entries(CSSSelectorValue.children);

    //for (let [ClassName, SelectorValue] of keyframeEntries) {

    //Clean Class Name
    let ClassName = CSSSelectorName;

    ClassName = ClassName.replace(/\.?(.*)/g, "$1").trim();

    //Get attributeValue and attributeName to array
    let EntriesProps = Object.entries(CSSSelectorValue.attributes); //Seperates values attributes
    let Properties = [];
    //loop through attributes
    for (const [attributeName, attributeValue] of EntriesProps) {
      //properties
      let prop = { name: null, value: null };
      prop.name = attributeName;
      prop.value = attributeValue;
      Properties.push(prop); //add property to Properties
    }

    let Class = {
      classname: ClassName,
      properties: Properties
    };
    ClassesArr.push(Class);

    //}//for

    //if Class
  }

  return ClassesArr;
} //JsonCssToClasses()

// ==== Convert classes object to angular styles object
function ClassesToStyles(ClassesArr) {
  let Styles = {};
  var propsTostyle = PropArr => {
    var prop = {};
    for (var i = 0; i < PropArr.length; i++) {
      const propObj = PropArr[i];
      propObj.value = propertySpecialCases(propObj.value);
      prop[propObj.name] = propObj.value;
    }
    let styleStr = `style(${JSON.stringify(prop)})`;
    styleStr = CleanStr(styleStr);
    return styleStr;
  };

  for (let i = 0; i < ClassesArr.length; i++) {
    const ClassObj = ClassesArr[i];
    var styleStr = propsTostyle(ClassObj.properties);
    styleStr = styleStr.replace(/"/g, `'`);
    //check if class alread exsists
    if (Styles[ClassObj.classname]) {
      Styles[ClassObj.classname + "_i"] = styleStr;
      console.log("Duplicate classes was found");
      console.log(ClassObj.classname);
    } else {
      Styles[ClassObj.classname] = styleStr;
    }
  } //for
  return Styles;
} //ClassesToStyles()

// ==== Convert keyframes object to angular keyframes object
function JsonCssToKeyframes(str, obj = null) {
  //if it's key frame
  var CSSObjectsArr = obj;
  if (!obj) {
    // clean new lines
    str = str.replace(/[\b\f\n\r\t\v\0]/g, "");
    CSSObjectsArr = JSON.parse(str);
  }
  var CSSObject = CSSObjectsArr.children;
  var Frames = [];
  const CSSObjectEntreis = Object.entries(CSSObject);

  //loop through every selecor to Extract children
  let Offsetkeyframes = [];
  for (const [CSSSelectorName, CSSSelectorValue] of CSSObjectEntreis) {
    //If Selector name is a keyframe
    if (CSSSelectorName.match(/.*(keyframes)/g)) {
      //@keyframe
      var Frame;

      let framesArr = [];
      let offsetProperties = [];

      //look for children of object and seperate selector and value
      const keyframeEntries = Object.entries(CSSSelectorValue.children);

      for (let [SelectorName, SelectorValue] of keyframeEntries) {
        //Keyframe Percentages and values

        //Clean Selector name//** for keyframes only */
        SelectorName = SelectorName.replace("from", "0%").replace("to", "100%");
        SelectorName = SelectorName.replace(/[^0-9,]/g, "");

        let calcPercentageArr = SelectorName.split(",")
          .map(Number)
          .map(n => n / 100);

        //Get attributeValue and attributeName to array
        let EntriesProps = Object.entries(SelectorValue.attributes); //Seperates values attributes
        let Properties = [];
        //loop through attributes
        for (const [attributeName, attributeValue] of EntriesProps) {
          //properties
          let prop = { name: null, value: null };
          prop.name = attributeName;
          prop.value = attributeValue;
          Properties.push(prop); //add property to Properties
        }
        //convert properties to frameproperties
        for (let i = 0; i < calcPercentageArr.length; i++) {
          let keyframeprops = [...Properties];
          const percent = calcPercentageArr[i];
          //let offsetProp:{name:string,value:string}//offsetProp
          //offsetProp.name="offset";
          //offsetProp.value=""+percent;
          //keyframeprops.push(offsetProp)
          let offsetProperty = {
            percent: percent,
            properties: Properties
          };
          offsetProperties.push(offsetProperty);
        }

        for (const property of Properties) {
          framesArr.push(property);
        }
      } //for
      Frame = {
        name: CSSSelectorName, //selector name
        frames: framesArr
      };
      Frames.push(Frame);
      //console.log(offsetProperties);
      let Offsetkeyframe = {
        keyframeName: CSSSelectorName,
        offsetArr: offsetProperties
      };

      Offsetkeyframes.push(Offsetkeyframe);
      //OffsetArray.push(offsetProperties);
    } //if

    //console.log(Offsetkeyframes);
  }
  //} //for
  //console.log(Frames);
  return Offsetkeyframes;
} //JsonCssToKeyframes()

// == check if the property is a special property for angular only
function propertySpecialCases(value) {
  if (typeof value == "string") {
    if (value.match(/\"\*\"/g) || value.match(/\'\*\'/g)) {
      value = value.replace(/\"\*\"/g, "*").replace(/\'\*\'/g, "*");
    }
  }
  return value;
}

function KeyframesToAngularKeyframes(_CSSObject) {
  var OffsetToProp = offsetArr => {
    let OffArr = [];
    //Read offsets and convert it to types
    for (let i2 = 0; i2 < offsetArr.length; i2++) {
      /**Offset */
      const offset = offsetArr[i2];
      let styleProp = {};
      for (let i3 = 0; i3 < offset.properties.length; i3++) {
        var property = offset.properties[i3];
        property.value = propertySpecialCases(property.value);
        styleProp[property.name] = property.value;
      } //for i3
      styleProp["offset"] = offset.percent;
      OffArr.push(styleProp);
    } //for i2 /**Offset */
    return OffArr.sort((a, b) => {
      return a.offset - b.offset;
    });
  };

  var propsToKeyframeString = OffArr => {
    let StylesString = "";
    for (var i = 0; i < OffArr.length; i++) {
      const off = OffArr[i];
      let styleStr = `style(${JSON.stringify(off)})`;
      styleStr = CleanStr(styleStr);
      StylesString = `${StylesString}${styleStr}`;
      if (i != OffArr.length) {
        //add , if it's not last
        StylesString = `${StylesString},`;
      }
    }
    let keyframesString = `keyframes([${StylesString}])`;
    return keyframesString;
  };

  var KeyframeSelectorToName = keyframeName => {
    let name = /@?.*keyframes(.*)/g.exec(keyframeName)[1].trim();
    return name;
  };

  var CSSObject = _CSSObject;
  var TransformedOnj = {};
  for (let i = 0; i < CSSObject.length; i++) {
    /**  *****    Key frame ******         */
    const Keyframe = CSSObject[i];

    // offset to properties
    let OffArr = OffsetToProp(Keyframe.offsetArr);

    let KeyString = propsToKeyframeString(OffArr);
    let keyframeName = KeyframeSelectorToName(Keyframe.keyframeName);
    KeyString = KeyString.replace(/'/g, "`").replace(/\\\"/g, "`");
    TransformedOnj[keyframeName] = KeyString.replace(/"/g, "'");
  } //for i1 /**Key frame */
  return TransformedOnj;
} //KeyframesToAngularKeyframes()

function finalizeString(str) {
  str = str.replace(/\\\\/g, `\\`);
  return str;
}

function ReadyTsString(classesString, keyframesStrnig, AddImports = true) {
  let imports = AddImports
    ? `import {trigger,state,style,animate,transition, group,keyframes} from "@angular/animations";
  `
    : ``;

  let JsonCss = `{
      class:${classesString},
      Animations:${keyframesStrnig}
  }`;
  var OutData = `${imports}export const GeneratedStyles=${JsonCss};`;
  return OutData;
}

//var data = JSON.stringify(json).replace(/[\b\f\n\r\t\v\0]/g, "");

// Read css file
var cssString = fs.readFileSync(fileInPath, "utf8", (err, data) => {
  if (err) {
    console.log(err);
  } else {
  }
});

// === Classes to angular styles
// convert css  to json object
var json = CSSJSON.toJSON(cssString);

// get classes
var classes = JsonCssToClasses("", json);

// convert classes to angular style objects
var Stylesclasses = ClassesToStyles(classes);

// stringfy the angular style objects
var classesString = JSON.stringify(Stylesclasses);

// === Keyframes to angular keyframes
// get keyframes
var keyframes = JsonCssToKeyframes("", json);

// convert keyframes to angular keyframes object
let AngularKeyframes = KeyframesToAngularKeyframes(keyframes);

// stringfy the angular keyframes object
var keyframesStrnig = JSON.stringify(AngularKeyframes);
keyframesStrnig = keyframesStrnig.replace(/`/g, '"');

// always true
if (ToFunctions) {
  keyframesStrnig = keyframesStrnig
    .replace(/":"/g, `":`)
    .replace(/","/g, `,"`)
    .replace(/,\]\)"\}/g, `])}`);
  classesString = classesString
    .replace(/":"/g, `":`)
    .replace(/","/g, `,"`)
    .replace(`})"}`, `})}`);
}

var OutData = ReadyTsString(classesString, keyframesStrnig, AddImports);
OutData = finalizeString(OutData);

// ======== Write .ts file
fs.writeFile(fileOutPath, OutData, err => {
  if (err) {
    console.log(err);
  } else {
    var t1 = new Date();
    var diff = (t1 - t0) / 1000;

    var baymessage = `

Done,Call time ${diff} seconds.

================ css-to-angular-animations ==================
            ==================================

This project is created by MoustafaMohsen, visit moustafamohsen.com for other awesome projects or to get in touch.

Contributors:
- Moustafa Mohsen - Creator https://moustafamohsen.com

Feel free to contribute to the project, thank:
https://github.com/MoustafaMohsen/css-to-angular-animations-and-styles#Contributing

            ==================================
==============================================================
  `;
    console.log(baymessage);
  }
});
