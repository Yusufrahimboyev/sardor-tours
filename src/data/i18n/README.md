# Tour translations

`../tours.i18n.json` holds Russian (`ru`) and Uzbek (`uz`, Latin script) translations of the
English tour texts in `../tours.json`. It is merged when the tour store is seeded; after that,
translations are edited in the admin panel.

Shape — keyed by tour slug; every field is optional (missing → English is shown):

```json
{
  "<slug>": {
    "ru": {
      "name": "", "title": "", "excerpt": "",
      "duration": "", "detailDuration": "", "schedule": "", "timeText": "",
      "highlights": [""], "included": [""], "notIncluded": [""], "bring": [""],
      "itinerary": [{ "title": "", "text": "" }],
      "faq": [{ "q": "", "a": "" }],
      "infoHeading": "",
      "destinationCards": [{ "tag": "", "title": "", "text": "" }],
      "goodToKnow": [{ "title": "", "text": "" }],
      "options": { "<option key>": "<label>" },
      "metaTitle": "", "metaDescription": ""
    },
    "uz": { "...same fields..." }
  }
}
```

Arrays must have the same length and order as the English arrays.
