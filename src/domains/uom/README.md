# Unit of Measurement

Nomie's Unit of Messurement is used to convert a UOM and a value into a formated string.

```
import { uom } from "nomie-utils"

console.log(uom.format(100.34, 'dollars'))
```

## Methods

### format(value, uomKey)

Returns a formated value. Example `uom.format(10,'dollars')` generates `$10.00`

---

### toArray()

Get an array of all possible UOMS

---

### toGroupedArray()

An object of types containing an array of UOMs

---

### plural(uomKey)

Get the plural name of the unit. For example: `uom.plural('inch')` outputs `Inches`

---
