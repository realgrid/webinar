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
          "right": 0,
          "dateFormat": "yyyy-MM-dd",
          "text": ""
        }
      ]
    },
    "reportHeader": {
      "name": "reportHeader",
      "height": "60px",
      "items": [
        {
          "type": "text",
          "name": "",
          "text": "다단 리포트",
          "styles": {
            "fontSize": "24px",
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
          "type": "text",
          "value": "${pages}",
          "width": 37,
          "name": "",
          "right": 0,
          "text": "",
          "styles": {
            "textAlign": "left",
            "_tag_": {}
          }
        },
        {
          "type": "text",
          "name": "",
          "right": "38px",
          "text": "/"
        },
        {
          "type": "text",
          "value": "${page}",
          "name": "",
          "right": "45px",
          "text": "Text",
          "styles": {
            "textAlign": "right",
            "_tag_": {}
          }
        }
      ]
    },
    "body": {
      "itemGap": 4,
      "items": [
        {
          "type": "simpleband",
          "data": "mail-label",
          "width": "100%",
          "name": "",
          "sectionCount": 2,
          "sectionGap": 50,
          "rowsPerPage": 6,
          "detail": {
            "type": "details",
            "width": "100%",
            "name": ""
          },
          "groups": [],
          "header": {
            "type": "stack",
            "name": "bandHeader",
            "width": 350.4960629921259
          },
          "footer": {
            "type": "stack",
            "name": "bandPageFooter",
            "width": "100%"
          },
          "dataRow": {
            "type": "stack",
            "name": "bandrow",
            "width": "100%",
            "onGetStyles": "",
            "styles": {
              "paddingRight": "px",
              "paddingBottom": "30px",
              "_tag_": {}
            },
            "styleCallback": null,
            "items": [
              {
                "type": "stack",
                "width": "100%",
                "height": 105,
                "name": "",
                "styles": {
                  "backgroundColor": "ivory",
                  "paddingLeft": "10px",
                  "paddingTop": "10px",
                  "paddingRight": "10px",
                  "paddingBottom": "10px",
                  "border": "1px solid",
                  "_tag_": {}
                },
                "items": [
                  {
                    "type": "text",
                    "value": "PostalCode",
                    "name": "",
                    "visible": false,
                    "left": "0px",
                    "top": "0px",
                    "text": "Text",
                    "styles": {
                      "fontSize": "15px",
                      "_tag_": {}
                    }
                  },
                  {
                    "type": "text",
                    "value": "Address",
                    "name": "",
                    "visible": false,
                    "right": "0px",
                    "top": "30px",
                    "text": "Text",
                    "styles": {
                      "fontSize": "15px",
                      "_tag_": {}
                    }
                  },
                  {
                    "type": "text",
                    "value": "ContactName",
                    "name": "",
                    "visible": false,
                    "right": "50px",
                    "bottom": "0px",
                    "text": "Text",
                    "styles": {
                      "fontSize": "15px",
                      "fontWeight": "bold",
                      "_tag_": {}
                    }
                  },
                  {
                    "type": "text",
                    "value": "field",
                    "name": "",
                    "left": 153,
                    "top": 28,
                    "text": "Text"
                  }
                ]
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
    "mail-label": {
      "type": "band",
      "fields": [
        {
          "fieldName": "PostalCode",
          "dataType": "text",
          "sample": "742-170",
          "dateReader": null
        },
        {
          "fieldName": "Address",
          "dataType": "text",
          "sample": "가장동 78-3 상주시 대한민국",
          "dateReader": null
        },
        {
          "fieldName": "ContactName",
          "dataType": "text",
          "sample": "한석규",
          "dateReader": null
        },
        {
          "fieldName": "field",
          "dataType": "number",
          "sample": 0,
          "dateReader": null
        }
      ]
    }
  },
  "guid": "023b13cd-442e-4e45-a616-948b7aca35b3"
}