<script>
  import Card, { Content } from "@smui/card";
  import { ICON_COLOR } from "../js/common";
  import MdiIcon from "./MdiIcon.svelte";

  export let plugin;
</script>

<style>
  :global(.option-plugin-card) {
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16),
      0 2px 10px 0 rgba(0, 0, 0, 0.12);
    margin: 2px;
    flex-grow: 5;
    width: calc(33% - 4px);
    text-align: center;
  }
</style>

<Card class="option-plugin-card">
  <Content>
    <div class="mdc-typography--subtitle1">
      <MdiIcon size="24" icon={plugin.icon} color={ICON_COLOR} />
      {plugin.name}
    </div>

    <!-- <i class="material-icons md-24 primary-icon align-bottom">{{plugin.icon}}</i> {{plugin.name}} -->
    <!-- </span> -->
    {#each plugin.queries as query}
      <div class="mdc-typography--caption">{query}</div>
    {/each}
  </Content>
</Card>
