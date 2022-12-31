<script lang="ts">
  import dayjs from 'dayjs'

  export let sm: boolean = false
  import type Award from '../helpers/award.class'
  export let award: Award
</script>

<div class="award-badge" class:sm>
  <img src={`/images/awards/${award.id}.svg`} alt={award.name} class="w-100" />
  <div class="main">
    <div class="title">{award.name}</div>
    <p class="desc">{dayjs(award.timestamp).fromNow()}</p>
  </div>
</div>

<style lang="postcss" global>
  .award-badge {
    @apply p-1 pt-0;
    @apply rounded-md;
    @apply focus:outline-none;
    @apply focus:ring-2 ring-primary-500;
    @apply text-center;
  }
  .award-badge img {
    max-width: 140px;
    @apply w-full;
    @apply mx-auto;
  }

  .award-badge.sm {
    @apply items-center w-full;
  }
  .award-badge.sm img {
    @apply h-14 w-14;
    @apply mb-2;
  }

  .award-badge .desc {
    @apply text-gray-500 text-xs leading-tight;
  }
  .award-badge .title {
    @apply leading-tight font-semibold text-sm dark:text-white;
    @apply line-clamp-2;
    @apply mb-1;
  }
</style>
