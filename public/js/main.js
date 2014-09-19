$('#initiateForm').validate({
  rules: {
    Url: {
      required: true
    },
    ServiceCode: {
      digits: true
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