$('#initiateForm').validate({
  rules: {
    Url: {
      required: true
    },
    Mobile: {
      digits: true
    }
  }
});

$('#responseForm').validate({
  rules: {
    UserInput: {
      required: true
    }
  }
})