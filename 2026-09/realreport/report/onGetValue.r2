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
      "name": "pageHeader"
    },
    "reportHeader": {
      "name": "reportHeader",
      "items": [
        {
          "type": "text",
          "text": "onGetValue 활용하기",
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
          "type": "text",
          "data": "data-1",
          "value": "cost",
          "width": 209,
          "height": 129,
          "name": "",
          "onGetValue": "if (value >= 10000) {\n\t  return \"만원의 행복\"\n\t} else {\n\t  return value;\n\t}",
          "text": "Text",
          "styles": {
            "fontSize": "16px",
            "fontWeight": "bold"
          }
        },
        {
          "type": "image",
          "width": 52,
          "height": 52,
          "name": "",
          "image": "노란별"
        },
        {
          "type": "rating",
          "data": "data-1",
          "value": "star",
          "width": 100,
          "height": 20,
          "name": "",
          "onGetValue": "return 5",
          "shape": "star",
          "maximum": 5,
          "designValue": 2
        }
      ]
    }
  },
  "assets": {
    "/": [
      {
        "name": "노란별",
        "type": "img",
        "data": "/templates/asset/general/star-yellow.png"
      }
    ]
  },
  "data": {
    "data-1": {
      "type": "simple",
      "sample": {
        "number": 10000,
        "bool": true,
        "cost": 10000,
        "star": 1
      }
    }
  },
  "guid": "effebe9e-506c-4472-837d-53cd4857880f"
}