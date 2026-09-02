{
  "report": {
    "name": "reportRoot",
    "type": "report",
    "paperSize": "A4",
    "paperWidth": "210mm",
    "paperHeight": "297mm",
    "marginLeft": "12mm",
    "marginRight": "12mm",
    "marginTop": "15mm",
    "marginBottom": "15mm"
  },
  "page": {
    "name": "reportPage",
    "type": "report",
    "pageHeader": {
      "name": "pageHeader",
      "items": [
        {
          "type": "text",
          "value": "${date}",
          "name": "",
          "right": "5px",
          "dateFormat": "yyyy-MM-dd",
          "text": "Text"
        }
      ]
    },
    "reportHeader": {
      "name": "reportHeader",
      "height": 97,
      "items": [
        {
          "type": "text",
          "text": "상품 목록",
          "styles": {
            "fontSize": "30px",
            "fontWeight": "bold",
            "paddingLeft": "20px",
            "paddingRight": "20px",
            "borderBottom": "2px solid gray",
            "_tag_": {}
          }
        }
      ]
    },
    "reportFooter": {
      "name": "reportFooter"
    },
    "pageFooter": {
      "name": "pageFooter",
      "items": [
        {
          "type": "rbox",
          "width": 110,
          "height": 25,
          "name": "",
          "right": "0px",
          "itemsAlign": "end",
          "itemGap": 0,
          "items": [
            {
              "type": "text",
              "value": "${page}",
              "name": "",
              "text": "Text"
            },
            {
              "type": "text",
              "name": "",
              "text": "/"
            },
            {
              "type": "text",
              "value": "${pages}",
              "name": "",
              "text": "Text"
            }
          ]
        }
      ]
    },
    "body": {
      "itemGap": 0,
      "items": [
        {
          "type": "tableband",
          "data": "tabular",
          "width": "100%",
          "name": "",
          "detail": {
            "type": "details",
            "width": "100%",
            "name": ""
          },
          "colCount": 7,
          "columns": [
            {
              "width": "5%"
            },
            {
              "width": "15%"
            },
            {
              "width": "20%"
            },
            {
              "width": "10%"
            },
            {
              "width": "10%"
            },
            {
              "width": "40%"
            },
            {
              "width": "60px"
            }
          ],
          "header": {
            "name": "bandHeader",
            "width": "100%",
            "rowCount": 2,
            "fixed": false,
            "cellStyles": {},
            "rows": [
              {},
              {}
            ],
            "cells": [
              {
                "r": 0,
                "c": 0,
                "colspan": 7,
                "styles": {
                  "cellAlign": "right",
                  "paddingBottom": "10px",
                  "borderLeft": "none",
                  "borderRight": "none",
                  "borderTop": "none",
                  "borderBottom": "none"
                }
              },
              {
                "r": 0,
                "c": 6,
                "styles": {
                  "borderLeft": "0",
                  "borderRight": "0",
                  "borderTop": "0",
                  "borderBottom": "0"
                }
              }
            ],
            "items": [
              {
                "type": "text",
                "name": "",
                "col": 0,
                "row": 1,
                "text": "No"
              },
              {
                "type": "text",
                "name": "",
                "col": 1,
                "row": 1,
                "text": "제조회사"
              },
              {
                "type": "text",
                "name": "",
                "col": 2,
                "row": 1,
                "text": "모델명"
              },
              {
                "type": "text",
                "name": "",
                "col": 3,
                "row": 1,
                "text": "가격"
              },
              {
                "type": "text",
                "name": "",
                "col": 4,
                "row": 1,
                "text": "할인율"
              },
              {
                "type": "text",
                "name": "",
                "col": 5,
                "row": 1,
                "text": "설명"
              },
              {
                "type": "rbox",
                "height": 27,
                "name": "",
                "col": 0,
                "row": 0,
                "itemsAlign": "end",
                "itemGap": 0,
                "items": [
                  {
                    "type": "text",
                    "name": "",
                    "text": "제조사:",
                    "styles": {
                      "fontSize": "19px",
                      "_tag_": {}
                    }
                  },
                  {
                    "type": "text",
                    "data": "tabular",
                    "value": "company",
                    "name": "",
                    "text": "Text",
                    "styles": {
                      "fontSize": "19px",
                      "textAlign": "left",
                      "_tag_": {}
                    }
                  }
                ]
              },
              {
                "type": "text",
                "name": "",
                "col": 6,
                "row": 1,
                "text": "비고"
              }
            ]
          },
          "footer": {
            "name": "bandFooter",
            "width": "100%",
            "rowCount": 1,
            "fixed": false,
            "cellStyles": {},
            "rows": [
              {}
            ],
            "cells": []
          },
          "dataRow": {
            "name": "bandRow",
            "width": "100%",
            "onGetStyles": "",
            "rowCount": 1,
            "fixed": false,
            "minRowHeight": "30px",
            "cellStyles": {},
            "rows": [
              {}
            ],
            "cells": [
              {
                "r": 0,
                "c": 1,
                "styles": {
                  "cellAlign": "left"
                }
              },
              {
                "r": 0,
                "c": 2,
                "styles": {
                  "cellAlign": "left"
                }
              },
              {
                "r": 0,
                "c": 3,
                "onGetStyles": "",
                "styleCallback": null,
                "styles": {
                  "cellAlign": "right"
                }
              },
              {
                "r": 0,
                "c": 5,
                "styles": {
                  "cellAlign": "left"
                }
              }
            ],
            "styleCallback": null,
            "items": [
              {
                "type": "text",
                "value": "company",
                "name": "",
                "onGetStyles": "",
                "equalBlank": true,
                "col": 1,
                "row": 0,
                "text": "Company",
                "styleCallback": null
              },
              {
                "type": "text",
                "value": "model",
                "width": "100%",
                "name": "",
                "onGetStyles": "",
                "col": 2,
                "row": 0,
                "autoShrink": true,
                "text": "Model",
                "styles": {
                  "textAlign": "left",
                  "_tag_": {}
                },
                "styleCallback": null
              },
              {
                "type": "text",
                "value": "${no}",
                "name": "",
                "onGetStyles": "",
                "col": 0,
                "row": 0,
                "text": "Text",
                "styleCallback": null
              },
              {
                "type": "text",
                "value": "unitCost",
                "width": "100%",
                "name": "",
                "onGetValue": "",
                "onGetStyles": "",
                "blankFields": "ㅎㅇ",
                "col": 3,
                "row": 0,
                "autoShrink": true,
                "text": "Text",
                "styles": {
                  "textAlign": "right",
                  "_tag_": {}
                },
                "styleCallback": null
              },
              {
                "type": "text",
                "value": "discount",
                "name": "",
                "onGetValue": "",
                "onGetStyles": "",
                "blankFields": "",
                "col": 4,
                "row": 0,
                "suffix": "",
                "text": "Text",
                "styles": {
                  "textAlign": "right",
                  "_tag_": {}
                },
                "styleCallback": null
              },
              {
                "type": "text",
                "value": "description",
                "width": "100%",
                "name": "",
                "onGetStyles": "",
                "col": 5,
                "row": 0,
                "wrap": true,
                "multiLine": true,
                "text": "Description",
                "styles": {
                  "textAlign": "left",
                  "paddingLeft": "2px",
                  "_tag_": {}
                },
                "styleCallback": null
              },
              {
                "type": "image",
                "width": 52,
                "height": 52,
                "name": "",
                "visible": false,
                "onGetVisible": "// 할인율 데이터 따라 이미지 표기\n\tif (ctx.getValue('tabular', row, 'discount')) {\n\t  return true;\n\t}",
                "col": 6,
                "row": 0,
                "image": "image",
                "imageFit": "contain"
              }
            ]
          }
        }
      ]
    },
    "backItems": [
      {
        "type": "image",
        "data": "visible",
        "width": 417,
        "height": 215,
        "name": "",
        "onGetVisible": "// 데이터에 따라 워터마크 표시\n\tconst visible = ctx.getValue('visible', row, 'watermark');\n\t\n\treturn visible;",
        "image": "Logo",
        "styles": {
          "opacity": 0.6,
          "_tag_": {}
        }
      }
    ]
  },
  "assets": {
    "/": [
      {
        "name": "Logo",
        "type": "img",
        "data": "data:image/png;base64,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"
      },
      {
        "name": "image",
        "type": "img",
        "data": "data:image/png;base64,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"
      }
    ]
  },
  "data": {
    "tabular": {
      "type": "band",
      "fields": [
        {
          "fieldName": "company",
          "dataType": "text",
          "sample": "백두산",
          "description": "",
          "dateReader": null
        },
        {
          "fieldName": "model",
          "dataType": "text",
          "sample": "FA-210",
          "description": "",
          "dateReader": null
        },
        {
          "fieldName": "unitCost",
          "dataType": "number",
          "sample": "139000",
          "description": "",
          "dateReader": null
        },
        {
          "fieldName": "discount",
          "dataType": "text",
          "sample": "",
          "description": "",
          "dateReader": null
        },
        {
          "fieldName": "description",
          "dataType": "text",
          "sample": "열전사, 9600bps, ADF5매, 발신자표시, 폴링",
          "description": "",
          "dateReader": null
        }
      ]
    },
    "visible": {
      "type": "simple",
      "sample": {
        "watermark": false
      }
    }
  },
  "guid": "e7d96b42-8e76-402c-b448-883aea239028"
}