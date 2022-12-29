export default {
  install: app => {
    app.config.globalProperties.$filters = {
      date(value) {
        if (!value) {
          return "-";
        }
        return new Date(value).toLocaleDateString();
      }
    };
  }
};
