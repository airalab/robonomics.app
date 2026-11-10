<template>
  <robo-layout-section width="middle-wide">
    <robo-section card>
      <robo-text title="3" align="center">Page not found</robo-text>
      <robo-section offset="x1">
        <robo-text align="center">
          There is no page at <code>{{ $route.fullPath }}</code>.
        </robo-text>
      </robo-section>
      <robo-button router="/" block>Go to the main page</robo-button>
    </robo-section>
  </robo-layout-section>
</template>
