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
          "type": "rbox",
          "name": "",
          "right": 0,
          "itemGap": 4,
          "items": [
            {
              "type": "text",
              "name": "",
              "text": "Date:"
            },
            {
              "type": "text",
              "value": "${date}",
              "name": "",
              "text": "Text"
            }
          ]
        }
      ]
    },
    "reportHeader": {
      "name": "reportHeader",
      "height": "100px",
      "items": [
        {
          "type": "text",
          "text": "급여 대장",
          "styles": {
            "fontSize": "30px",
            "fontWeight": "bold",
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
          "name": "",
          "right": 0,
          "itemGap": 4,
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
              "text": "/",
              "styles": {
                "paddingLeft": "3px",
                "paddingRight": "3px",
                "_tag_": {}
              }
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
      "itemGap": 4,
      "items": [
        {
          "type": "tableband",
          "data": "account",
          "width": "100%",
          "name": "",
          "detail": {
            "type": "details",
            "width": "100%",
            "name": ""
          },
          "colCount": 4,
          "columns": [
            {
              "width": "150px"
            },
            {
              "width": "150px"
            },
            {
              "width": "20%",
              "styles": {
                "cellAlign": "right"
              }
            },
            {
              "width": "20%",
              "styles": {
                "cellAlign": "right"
              }
            }
          ],
          "header": {
            "width": "100%",
            "name": "",
            "rowCount": 1,
            "fixed": false,
            "cellStyles": {},
            "rows": [
              {
                "height": "40px"
              }
            ],
            "cells": [],
            "styles": {
              "backgroundColor": "#b5deff",
              "_tag_": {}
            },
            "items": [
              {
                "type": "text",
                "width": "100%",
                "name": "",
                "col": 0,
                "row": 0,
                "text": "이름"
              },
              {
                "type": "text",
                "width": "100%",
                "name": "",
                "col": 2,
                "row": 0,
                "text": "급여"
              },
              {
                "type": "text",
                "width": "100%",
                "name": "",
                "col": 1,
                "row": 0,
                "text": "직급"
              },
              {
                "type": "text",
                "width": "100%",
                "name": "",
                "col": 3,
                "row": 0,
                "text": "밴드 헤더",
                "styles": {
                  "fontWeight": "bold",
                  "_tag_": {}
                }
              }
            ]
          },
          "footer": {
            "width": "100%",
            "height": "40px",
            "name": "",
            "rowCount": 1,
            "fixed": false,
            "cellStyles": {},
            "rows": [
              {}
            ],
            "cells": [
              {
                "r": 0,
                "c": 0,
                "colspan": 2,
                "styles": {
                  "paddingLeft": "8px",
                  "paddingRight": "8px"
                }
              },
              {
                "r": 0,
                "c": 2,
                "styles": {
                  "paddingLeft": "8px",
                  "paddingRight": "8px"
                }
              },
              {
                "r": 0,
                "c": 3,
                "styles": {
                  "paddingLeft": "8px",
                  "paddingRight": "8px"
                }
              }
            ],
            "styles": {
              "backgroundColor": "#b5deff",
              "_tag_": {}
            },
            "items": [
              {
                "type": "text",
                "width": "100%",
                "name": "",
                "col": 0,
                "row": 0,
                "text": "급여 총액",
                "styles": {
                  "textAlign": "right",
                  "_tag_": {}
                }
              },
              {
                "type": "summary",
                "width": "100%",
                "name": "",
                "col": 2,
                "row": 0,
                "expression": "sum(value)",
                "styles": {
                  "textAlign": "right",
                  "_tag_": {}
                }
              },
              {
                "type": "text",
                "width": "100%",
                "name": "",
                "col": 3,
                "row": 0,
                "text": "밴드 푸터",
                "styles": {
                  "fontWeight": "bold",
                  "_tag_": {}
                }
              }
            ]
          },
          "dataRow": {
            "width": "100%",
            "height": "40px",
            "name": "",
            "rowCount": 1,
            "fixed": false,
            "cellStyles": {
              "paddingRight": "",
              "paddingLeft": "",
              "padding": "8px"
            },
            "rows": [
              {}
            ],
            "cells": [],
            "items": [
              {
                "type": "text",
                "value": "name",
                "name": "",
                "col": 0,
                "row": 0
              },
              {
                "type": "text",
                "value": "value",
                "name": "",
                "col": 2,
                "row": 0,
                "styles": {
                  "textAlign": "right",
                  "_tag_": {}
                }
              },
              {
                "type": "text",
                "value": "position",
                "name": "",
                "col": 1,
                "row": 0
              },
              {
                "type": "text",
                "value": "bigo",
                "name": "",
                "col": 3,
                "row": 0,
                "styles": {
                  "textAlign": "right",
                  "_tag_": {}
                }
              }
            ]
          }
        }
      ]
    }
  },
  "assets": {
    "/": []
  },
  "data": {
    "account": {
      "type": "band",
      "fields": [
        {
          "fieldName": "name",
          "dataType": "text",
          "description": "",
          "sample": "",
          "format": "",
          "dateReader": null
        },
        {
          "fieldName": "team",
          "dataType": "text",
          "description": "",
          "sample": "",
          "format": "",
          "dateReader": null
        },
        {
          "fieldName": "value",
          "dataType": "number",
          "description": "",
          "sample": "",
          "format": "",
          "dateReader": null
        },
        {
          "fieldName": "position",
          "dataType": "text",
          "description": "",
          "sample": "",
          "format": "",
          "dateReader": null
        },
        {
          "fieldName": "bigo",
          "dataType": "text",
          "source": "",
          "format": "",
          "sample": "",
          "expression": "",
          "description": "",
          "dateReader": null
        }
      ]
    }
  },
  "guid": "81bcea20-be67-4aa5-b4a2-ce92624ecfbb"
}