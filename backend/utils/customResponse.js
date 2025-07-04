const customResponse = (message, statusCode, success) => {
    return (req, res) => {
      res.status(statusCode).json({
        message,
        status: statusCode,
        success
      });
    };
  };
  
  const authError = (error) => {
    return {
      message: error.details[0].message,
      status: 422,
      success: false
    };
  };
  
  module.exports = {
    customResponse,
    authError
  };