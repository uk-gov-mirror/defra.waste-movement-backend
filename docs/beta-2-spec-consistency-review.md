# beta-2 spec consistency review

Consistency check of the five beta-2 endpoints: they should use the same names and data shapes for the same concepts.

- **Spec:** `src/schemas/beta-2/openapi.json` and the schemas it references.
- **Conventions:** `src/schemas/README.md` already sets the conventions; this review applies them.
- **Scope:** request payloads. Response and error shapes, alignment with the docs site, and changes since beta-1 are out of scope (see [Out of scope](#out-of-scope)).

| Endpoint | Request schema |
|---|---|
| Creation — `POST /movements` | `creation/create-movement-request` |
| Collection — `POST /movements/{movementId}/collection` | `collection/create-collection-request` |
| Delivery — `POST /deliveries` | `delivery/record-delivery-request` |
| Receipt — `POST /deliveries/{deliveryId}/receipt` | `receipt/record-receipt-request` |
| Receipt without Delivery ID — `POST /receipts` | `receipt/record-receipt-undocumented-request` |

## Status

- [ ] 1. Same concept, same field name — in [#241](https://github.com/DEFRA/waste-movement-backend/pull/241), to be decided separately
- [x] 2. One enum casing convention — #240
- [x] 3. One true/false naming pattern — #251
- [ ] 4. "Reason for no…" fields — partly done in #246; broker or dealer example still open
- [x] 5. One term for the delivery step — #242
- [ ] 6. Singular and plural names — in [#243](https://github.com/DEFRA/waste-movement-backend/pull/243), to be decided separately
- [ ] 7. Descriptions refer to current field names — one stale sentence
- [x] 8. Shared objects use the common schema — #244
- [ ] 9. Parties share a core shape — needs a decision: O7
- [ ] 10. Same role, same required/optional — needs a decision: O8
- [x] 11. Gated objects follow one pattern — kept: D11 (#251)
- [x] 12. Mutually exclusive fields enforced the same way — #247, #249
- [x] 13. Waste details on both receipt endpoints — no change: D8
- [x] 14. Every object rejects unknown fields — D9, README updated in #248
- [ ] 15. Addresses outside the UK and Ireland — needs a decision: O13
- [x] 16. EWC codes, POPs and hazardous declarations can disagree — accepted: D14. `HP_POP` vs POPs still open: O9
- [ ] 17. Free-text fields have one length limit — two tiers agreed (O15), not applied yet
- [ ] 18. Every `OTHER` enum value has an `other<Field>` — `supportingReferences[].label` has none: O16
- [ ] Also found — mostly open: see the table

---

## Checks: naming and casing

### 1. Same concept, same field name

**In [#241](https://github.com/DEFRA/waste-movement-backend/pull/241)**, to be decided separately.

| Finding | Status |
|---|---|
| `receiver.siteName` where other parties have `organisationName` | Deliberate: see D1 |
| `receiver.receiptAddress` where every other party and site has `address` | Needs a decision: part of O3, site naming |
| `actualCollectionDateTime` (Collection) vs `receiptDateTime` (Receipt). The event already means it's the actual time, so the pattern is `<event>DateTime`. | #241 renames it to `collectionDateTime`. `plannedCollectionDateTime` on Creation keeps its prefix. |
| `otherMeansOfTransport` sits beside `meansOfTransport`, but doesn't start with the noun it qualifies | Keep: it follows the `other<Field>` pattern (D13). **#241 renames it to `meansOfTransportDescription`; drop that rename from #241** |

#241 also adds the naming rules to the README: noun first for siblings, `<event>DateTime` for event times, and the known exceptions (`siteName`, `receiptAddress`, the `reasonForNoX` family). Its table of noun-first examples lists `meansOfTransportDescription`; take that row out too.

The `reasonForNoX` family (`reasonForNoRegistrationNumber`, `reasonForNoAuthorisationNumber`, `reasonForNoCode`, `reasonForNoDeliveryId`) breaks the noun-first rule, but consistently, so renaming them is all or nothing. → Needs a decision: see O5.

The `other<Field>` family is the same kind of exception, and is kept on purpose (D13): when an enum has an `OTHER` value, `other<Field>` beside it holds the free text, required when the enum is `OTHER` and not allowed otherwise. The README documents it next to `reasonForNo<Identifier>`. `otherMeansOfTransport` is the only one so far; `supportingReferences[].label` has an `OTHER` with no `otherLabel` (check 18). #241 lists it as a known exception in the meantime.

### 2. One enum casing convention

**Done in #240.** Every beta-2 enum is `SCREAMING_SNAKE` (`ROAD`, `INLAND_WATERWAY`, `COMMERCIAL`, `PO_NUMBER`), including the `wasteSource` discriminator. `errorType` and `propertyNames` enums are exempt. #247 made descriptions and error messages name values as they're sent. `conventions.test.js` enforces both.

### 3. One true/false naming pattern

**Done in #251.** Every boolean starts with `is`: `isPresent`, `isEstimate`, `isDutyOfCareConfirmed` (was `dutyOfCareConfirmed`) and `isComponentsNotApplicable` (was `componentsNotApplicable`; see check 11). `conventions.test.js` enforces it.

### 4. "Reason for no…" fields: same type and pattern

| Field | Where | Type |
|---|---|---|
| `reasonForNoRegistrationNumber` | `carrier` | enum `ON_SITE`, `HOUSEHOLD`, `ONE_OFF`, `MARINE` |
| `reasonForNoRegistrationNumber` | `brokerOrDealer.items[]` | free text, TBC |
| `reasonForNoAuthorisationNumber` | `producer` (Commercial, Municipal) | free text, TBC |
| `reasonForNoCode` | `consignmentNote` | free text |
| `reasonForNoDeliveryId` | Receipt without Delivery ID | free text |

- The broker or dealer type is kept until the requirements are known (D2), and its values are open (O4).
- **Open:** the broker or dealer example in `broker-or-dealer-entry.schema.json` (and its tests) still sends `"ONE_OFF"`, a carrier enum value, which suggests the two share an enum. Change it to free text that's clearly not an enum value until O4 is decided.
- **Done in #246:** `consignmentNote`'s `code` and `reasonForNoCode` are plain strings; `null` and `""` are rejected, as for every other optional field.

### 5. One term for the delivery step

**Done in #242.** The two uses of "transfer" in `broker-or-dealer-entry.schema.json` now say "Movement". #242 capitalises "Movement" there as the domain name, which is the opposite of what this review proposed (capitalise only as part of an ID name). Recorded as D12; the other descriptions still say "the movement" in lower case, so apply one rule throughout once D12 is confirmed.

### 6. Singular and plural names match the data

**In [#243](https://github.com/DEFRA/waste-movement-backend/pull/243)**, to be decided separately.

| Field | Data | Status |
|---|---|---|
| `specialHandlingRequirements` | a single string | #243 renames it to `specialHandlingInstructions` (Creation and Collection), and the common schema file with it |
| `brokerOrDealer` | an object wrapping a list (`items`) | #243 keeps the singular name and records it as the one exception. Closes O6 if merged |
| `contactDetails`, `physicalDetails` | objects | No change: "details" is a collective noun |
| `intendedCarriers`, `intendedReceivers`, `wasteItems`, `treatments`, `supportingReferences`, `movementIds`, `ewcCodes`, `codes`, `components` | arrays | No change |
| `carrier`, `receiver`, `producer`, `collectionSite`, `consignmentNote` | objects | No change |

### 7. Descriptions refer to current field names only

**Open.** One stale name remains:

- `creation/create-movement-request.schema.json`, `consignmentNote`: "Replaces hazardousWasteConsignmentCode and reasonForNoConsignmentCode." → Remove the sentence.

#241 and #243 rename fields that descriptions mention (e.g. the carrier description names `otherMeansOfTransport`). Run the check again after each merges.

---

## Checks: shared object structure

### 8. Shared objects use the common schema

**Done in #244.** Both producer variants `$ref` `common/authorisation-number.schema.json`, and both receipt requests `$ref` `common/receipt-date-time.schema.json`.

### 9. Producer, carrier, broker or dealer and receiver share a core shape

| | Name | Number | No-number alternative | Address | Contact details |
|---|---|---|---|---|---|
| Producer (Commercial, Municipal) | `organisationName` | `authorisationNumber` | `reasonForNoAuthorisationNumber` | required | required |
| Producer (Household) | — | — | — | — | — |
| Carrier | `organisationName` | `registrationNumber` | `reasonForNoRegistrationNumber` | optional | required |
| Broker or dealer | `organisationName` | `registrationNumber` | `reasonForNoRegistrationNumber` | optional | required |
| Receiver | `siteName` | `authorisationNumber` | **none: number always required** | required (`receiptAddress`) | required |
| Collection site | — | — | — | required | required |

The differences:

- **Household producer has no party fields:** Deliberate (see D4), since there's no organisation.
- **Receiver uses `siteName`:** Deliberate: see D1.
- **Authorisation number vs registration number:** Deliberate: see D5. They're different regulatory identifiers: an environmental permit for sites, a waste carrier/broker/dealer registration for those who move or arrange waste.
- **Receiver has no `reasonForNoAuthorisationNumber`:** Needs a decision: see O7. Every other party can say why a number is missing. Is a receiving site always permitted or exempt?
- **Optional addresses:** see check 10.

### 10. Same role, same required/optional status

`address` is required for producer, receiver and collection site, and optional for carrier and broker or dealer. `fullAddress` is optional and `postcode` required everywhere, so the `address` object itself is consistent.

The likely reason is that a carrier or broker is identified by its registration number, while a producer or site is identified by where it is. That seems reasonable, but it's not written down. Confirm it and record it as a decision, or make carrier and broker addresses required (O8).

### 11. Lists of repeating details follow one pattern

The `brokerOrDealer` `{ isPresent, items }` wrapper vs the plain `intendedCarriers` and `intendedReceivers` arrays is kept (D3), and `items` vs `components` is kept (D6).

Inside the gated objects:

| Object | Shape |
|---|---|
| `brokerOrDealer` | `{ isPresent, items }` |
| `pops` | `{ isPresent, componentsSource, components }` |
| `hazardous` | `{ isPresent, codes, componentsSource, isComponentsNotApplicable, components }` |

This review proposed removing `hazardous`' second flag, so that `isPresent` would be the only one, as in `pops`. #251 kept it and renamed it to `isComponentsNotApplicable` instead (D11). It still means nested `if`/`then`/`else` branches inside the `then` of `isPresent`.

### 12. Mutually exclusive fields are enforced the same way

**Done in #247 and #249.** Every pair uses the README's flat `if`/`then`/`else`, and every identifier/reason pair's descriptions end with "Exactly one of '<identifier>' or 'reasonForNo<Identifier>' is required." The consignment note keeps its own wording, because "exactly one" applies there only when the waste is hazardous (D7). The `containerCount` messages in `physical-details` now use single quotes and no full stop.

### 13. Waste details have the same structure on both receipt endpoints

Receipt has `physicalDetails` and `treatments` at the top level, while Receipt without Delivery ID nests them under `wasteItems[]`. This is as expected (D8).

### 14. Every object rejects unknown fields

Every object schema is closed: with `additionalProperties: false`, or, for the composed producer variants, with `propertyNames`. The `wasteItems.items` overlays are left open because the schema they `$ref` is closed (D9). #248 updated the README's "Response schemas" and "Adding a resource" sections to match.

### 15. Addresses outside the UK and Ireland

`common/address.schema.json` accepts only a UK or Irish address: `postcode` is required, and its pattern accepts only UK postcodes and Irish Eircodes. Some carriers are based abroad, so they can't send a valid address. The same schema is used by every party and site: carrier, broker or dealer, producer (Commercial, Municipal), receiver and collection site.

To decide:

- **Which parties can be overseas.** Carriers, and probably brokers or dealers. Producers, receivers and collection sites are presumably always in the UK, since the movement is regulated here. If so, only carrier and broker or dealer addresses need to change.
- **How the schema says where an address is.** Proposed: add `country`, an ISO 3166-1 alpha-2 code (`GB`, `IE`, `FR`). An `if` on `country` applies the UK/Eircode `postcode` pattern only for `GB` and `IE`; for any other country, `postcode` is an optional free-text string and `fullAddress` is required, since some countries have no postcodes. This follows the README's `if`/`then`/`else` rule; a `oneOf` of UK and overseas address variants would report both branches' errors.
- **Whether `country` is required.** If it's optional and a missing `country` means UK or Ireland, existing payloads stay valid. If it's required, every caller has to change, but the address is never ambiguous.
- **Where the rule lives.** If only some parties can be overseas, either keep one `address` schema and forbid non-UK countries with an overlay on the UK-only parties, or split it into a UK address and an international address. An overlay keeps one schema, as the README prefers.

### 16. EWC codes, POPs and hazardous declarations can disagree

A waste item's `classification` has three signals that overlap, and the API doesn't check them against each other:

| Signal | What it says | Used for |
|---|---|---|
| `ewcCodes` | The EWC catalogue marks some codes as hazardous (the asterisked entries); mirror codes can be either | Checked only as recognised codes |
| `hazardous.isPresent` / `codes` | The caller's declaration of hazardous properties (`HP_1`–`HP_15`, `HP_POP`) | Whether the movement is hazardous: consignment note required, own delivery |
| `pops.isPresent` / `components` | The caller's declaration of POPs | Nothing beyond its own validation |

**How it got here.** #224 (DWTC-248) decided hazard from the EWC codes (`hasHazardousEwcCode`). #227 switched it to the `hazardous.isPresent` declaration (`isHazardous` in `src/common/helpers/waste-reference-data-checks.js`) and stopped using the EWC hazard flag at all. Tests now pin the result: a hazardous EWC code declared with `isPresent: false` is created without a consignment note and delivered with the non-hazardous movements, and a non-hazardous EWC code declared hazardous needs one (`create-movement.test.js`, `record-delivery.test.js`). Nothing in the schemas or the README says the EWC code's hazard flag is ignored.

**Accepted (D14).** A hazardous EWC code with `hazardous.isPresent: false`, or the reverse, is allowed. The spec can't condition anything on an EWC code: whether a code is hazardous is in reference data too long to inline. The caller's `hazardous` declaration decides whether a movement is hazardous.

**Still open:** `HP_POP` in `hazardous.codes` while `pops.isPresent` is `false` (O9). Unlike the EWC case, both declarations are in the schema, under `classification`, so the spec could reject it.

**Still worth doing:** say in `hazardous.isPresent`'s description and the README that the declaration, not the EWC code, decides whether a movement is hazardous.

**Related naming:** POP components are identified by `code`, checked against `GET /reference-data/pop-names`, whose entries have both a `code` and a `name`; only the `code` is accepted. Hazardous components are identified by `name`, as free text with no reference list. Say in `pop-component`'s `code` description that it's the entry's `code`, not its `name`.

### 17. Free-text fields have the same length limits

Of the 19 free-text request fields (a plain string, with no `pattern`, `enum` or `format`), only two have a `maxLength`, and they don't share a value:

| Field | `maxLength` |
|---|---|
| `specialHandlingRequirements` | 500. The legacy API's `LONG_STRING_MAX_LENGTH` (`waste-movement-utils`) is 5000 |
| `supportingReferences[].reference` | 50 |
| `organisationName` (carrier, broker or dealer, producer Commercial and Municipal), `receiver.siteName`, `address.fullAddress`, `carrier.vehicleRegistration`, `carrier.otherMeansOfTransport`, `classification.wasteDescription`, `hazardous-component.name`, `pop-component.code`, `reasonForNoRegistrationNumber` (broker or dealer), `reasonForNoAuthorisationNumber` (×2), `consignmentNote.reasonForNoCode`, `reasonForNoDeliveryId` | none |

Every one has `minLength: 1`. Fields with a `pattern` (postcode, phone number, SIC code, registration and authorisation numbers, consignment code, EWC code, IDs) are already bounded by it. `issue.pointer` and `issue.message` are in the response, so they're out of scope.

**Agreed: two tiers** (O15).

| Tier | `maxLength` | Fields |
|---|---|---|
| Short text | 255 | names, references, `reasonForNo…` fields, `vehicleRegistration`, component `name` and `code` |
| Long text | 5000, as the legacy API | `wasteDescription`, `fullAddress`, `specialHandlingInstructions`, `otherMeansOfTransport` |

To apply it, in its own PR:

- Add a "Free text has a length limit" section to the README naming the two tiers, and say in each field's description which one it is.
- Set `maxLength` on every field above. `supportingReferences[].reference` rises from 50 to 255 and `specialHandlingInstructions` from 500 to 5000, unless either 50 or 500 was deliberate; check before changing them.
- Add a `conventions.test.js` check that every beta-2 request string without a `pattern`, `enum`, `const` or `format` has a `maxLength` of 255 or 5000.
- #241 and #243 rename two of these fields; apply the limits to whichever names have merged.

### 18. Every `OTHER` enum value has an `other<Field>`

The README's new `other<Field>` rule (D13): an enum that ends with `OTHER` has an `other<Field>` beside it, required when the enum is `OTHER` and not allowed otherwise.

| Enum | `OTHER` free text | Status |
|---|---|---|
| `carrier.meansOfTransport` | `otherMeansOfTransport` | Follows it |
| `supportingReferences[].label` | none | Open: O16 |

`supportingReferences[]` is a `label` / `reference` pair, so with `OTHER` the caller sends a reference with no way to say what kind it is. Add `otherLabel` (short text, check 17), required when `label` is `OTHER`. Or, if `reference` alone is enough there, record that as a decision instead.

A `conventions.test.js` check could fail any enum containing `OTHER` whose parent has no `other<Field>`.

### Also found

| Finding | Status |
|---|---|
| Collection endpoint files and route are `create-collection`, but the operation is `recordCollection`, and Delivery and Receipt are `record-*` | Needs a decision: see O10. Proposed rule: `create-*` for a route that creates a resource, `record-*` for one that records an event. |
| `openapi.json` component `deliveryResponse` breaks the `record<X>Response` pattern | Open: rename to `recordDeliveryResponse` |
| `producer-base.schema.json` has no properties, but its description says "Fields present on every Producer" | Open: say in its description that it's a placeholder |
| Delivery has no `deliveryDateTime`, while Collection and Receipt record when they happened | Needs a decision: see O11 |
| `pop-component` and `hazardous-component` could nest `amount` + `unit` as `concentration: { amount, unit }`, shaped like `weight` | Needs a decision: see O12. #231 (DWTC-223) only recently set the flat shape, so check with the ticket first. |

---

## Decisions log

There's no API decisions log yet, in this repo or in `digital-waste-tracking-docs`. Move these there once one exists.

| ID | Decision | Reason | By |
|---|---|---|---|
| D1 | Receiver keeps `siteName`; other parties use `organisationName` | A receiver is identified as a site, not an organisation (reason inferred; confirm) | Perry |
| D2 | Broker or dealer `reasonForNoRegistrationNumber` stays free text, while carrier's is an enum | The broker values aren't known yet (O4) | Perry |
| D3 | `brokerOrDealer` keeps the `{ isPresent, items }` wrapper; `intendedCarriers` and `intendedReceivers` stay plain arrays | A broker or dealer needs an explicit "none" declaration; carriers and receivers always have at least one (reason inferred; confirm) | Perry |
| D4 | Household producer has no party fields | There's no organisation to identify | Existing schema rule |
| D5 | Authorisation number for producer and receiver; registration number for carrier and broker or dealer | Different regulatory identifiers | Proposed |
| D6 | Gated arrays are `items` on `brokerOrDealer` and `components` on `pops` and `hazardous` | `components` is the domain term | Proposed |
| D7 | `consignmentNote` enforces only "not both" in the schema; the service checks "one of" | It depends on whether any waste item is hazardous, which spans resources (README) | Existing schema rule |
| D8 | Receipt has top-level `physicalDetails` and `treatments`; Receipt without Delivery ID nests them in `wasteItems[]` | As expected | Perry |
| D9 | Composed producer variants are closed with `propertyNames`; the `wasteItems.items` overlays are left open | `additionalProperties` can't close an `allOf`, and the overlays add constraints to schemas that are already closed | Proposed |
| D10 | All objects, requests and responses, reject unknown fields | Agreed; #221 | Team |
| D11 | `hazardous` keeps its second flag, renamed `isComponentsNotApplicable` | #251 | Team |
| D12 | "Movement" is capitalised as a domain name in descriptions | #242 (capitalise names) | Team |
| D13 | An enum with an `OTHER` value has an `other<Field>` free-text field beside it, required only when the enum is `OTHER`. `otherMeansOfTransport` keeps its name | Same kind of exception to noun-first as `reasonForNo<Identifier>`; README | Team |
| D14 | EWC codes and the `hazardous` declaration aren't cross-checked; the declaration decides whether a movement is hazardous | The spec can't condition on an EWC code's hazard flag, which is reference data | Team |

## Open items

| ID | Item | Recommendation | Owner | Status |
|---|---|---|---|---|
| O1 | Enum casing convention | `SCREAMING_SNAKE` everywhere | Team | Done: #240 |
| O2 | True/false naming | `is` prefix | Team | Done: #251 |
| O3 | Site naming: `collectionSite`, receiver site, delivery site | Keep `collectionSite`. Rename `receiver.receiptAddress` to `address`. There's no delivery site today, so add one only if Delivery needs one. | Team | Open |
| O4 | Broker or dealer "reason for no registration number" values | — | BA / policy | Open |
| O5 | Rename the `reasonForNoX` family noun-first | All four or none | Team | Open; listed as an exception in #241 |
| O6 | `brokerOrDealer` → `brokersOrDealers` | #243 keeps the singular name as an exception | Team | In #243 |
| O7 | Receiver has no "reason for no authorisation number" | Confirm a receiving site always has a permit or exemption | BA / policy | Open |
| O8 | Carrier and broker or dealer `address` optional; producer, receiver and site required | Record as deliberate if confirmed | BA | Open |
| O9 | `HP_POP` in `hazardous.codes` vs `pops.isPresent: false` (check 16) | Decide whether to reject, warn or allow | BA | Open |
| O10 | `create-collection` → `record-collection` | Rename the route, schema files and examples | Team | Open |
| O11 | No `deliveryDateTime` on Delivery | Confirm whether it's deliberate | BA | Open |
| O12 | Nest concentration as `{ amount, unit }` | Check with DWTC-223 first | Team | Open |
| O13 | Overseas addresses (check 15) | Add `country` (ISO 3166-1 alpha-2); UK/Eircode `postcode` pattern only for `GB` and `IE`. Confirm which parties can be overseas, and whether `country` is required | BA / Team | Open |
| O14 | Hazardous EWC code with `hazardous.isPresent: false` (check 16) | Allow; document that the declaration decides | Team | Decided: D14 |
| O15 | Free-text length limits (check 17) | Two tiers: 255 short, 5000 long | Team | Agreed; to apply in its own PR |
| O16 | `supportingReferences[].label` `OTHER` has no free text (check 18) | Add `otherLabel` | Team / BA | Open |

## Out of scope

The ticket puts response and error shapes, alignment with the docs site, and changes since beta-1 out of scope. Findings in those areas, for a later ticket:

- **Problem-type URIs:** #222 moved them to the docs site, but the two 404 examples in `openapi.json` (`movement-not-found`, `delivery-not-found`) still use `https://waste-tracking.service.gov.uk/problems/...`.

## Done when

- Every check passes, and every difference kept on purpose has a row in the decisions log.
- `openapi.json`, the schemas and the `*.examples.json` files are updated together. `conventions.test.js` validates the examples, and `openapi-betas.test.js` resolves every `$ref`.
- Validation tests are updated for any renamed fields and pass: `npm test` and `npm run test:integration`. `test/integration/beta-2.test.js` asserts exact error messages.

**Files each rename touches:**

- `src/schemas/beta-2/**` (schemas, examples, tests, `test-helpers.js`)
- `src/schemas/README.md`, where a field appears in an example
- `src/routes/beta-2/*.test.js`
- `src/test/utils/createMovementRequest.js`
- `test/integration/beta-2.test.js`

As of this review, `waste-movement-external-api`, `digital-waste-tracking-uat` and `waste-tracking-service` don't use `actualCollectionDateTime`. They do use `otherMeansOfTransport` and `specialHandlingRequirements`, but only as the legacy Receipt API's own fields, which beta-2 renames don't change. Check them again before #241 and #243 merge.
