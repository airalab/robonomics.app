<template>
  <robo-section>
    <robo-section
      backColor="rgb(16, 202, 249)"
      backImage="images/ha-logo.png"
      backSize="contain"
      textColor="#ffffff"
      offset="x0"
      backPosition="100% 10%"
    >
      <robo-card-title size="2" offset="x0"
        >Home Assistant local</robo-card-title
      >
    </robo-section>

    <robo-section backColor="rgb(16, 202, 249)" textColor="#ffffff" offset="x1">
      <robo-section offset="x05">
        <robo-text weight="bold" inline>URL: </robo-text>
        <robo-text weight="normal-italic" inline
          >http://YOUR_LOCAL_ADDRESS:8123/ [Get exact address from your
          administrator or read
          <robo-link
            href="https://wiki.robonomics.network/docs/home-assistant-begin/"
            >our wiki guide</robo-link
          >]</robo-text
        >
      </robo-section>
      <robo-section offset="x05">
        <robo-text weight="bold" inline>Login: </robo-text>
        <robo-text weight="normal-italic" inline
          >your Parachain Address added in subscription</robo-text
        >
      </robo-section>
      <robo-section offset="x05">
        <robo-text weight="bold" inline>Password: </robo-text>
        <robo-text weight="normal-italic" inline
          >use password created here</robo-text
        >
      </robo-section>
    </robo-section>
  </robo-section>
</template>
