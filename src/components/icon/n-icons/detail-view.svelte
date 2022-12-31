<script lang="ts">
  export let size = "100%";
  export const solid = false;
  let customClass = "";
  export { customClass as class };

  if (size !== "100%") {
    size = size.slice(-1) === "x" ? size.slice(0, size.length - 1) + "em" : parseInt(size) + "px";
  }
</script>

<svg
  width={size}
  height={size}
  class="hero outline {customClass}"
  xmlns="http://www.w3.org/2000/svg"
  fill="none"
  viewBox="0 0 24 24"
  stroke="currentColor">

  <rect x="4" y="4" width="16" height="16" rx="4" stroke-width="2" />
  <circle cx="9" cy="9" r="1" stroke-width="2" />
  <line x1="7.5" y1="13" x2="16.5" y2="13" stroke-width="2" />
  <line x1="7.5" y1="16" x2="16.5" y2="16" stroke-width="2" />

</svg>
