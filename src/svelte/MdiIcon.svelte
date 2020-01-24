<script>
  export let size;
  export let icon;
</script>

<style>
.mdi-icon {
  vertical-align: middle;
  margin-right: 5px;
}
</style>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  class="mdi-icon"
  viewBox="0 0 24 24">
  <path d={icon} />
</svg>
