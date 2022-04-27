import * as commonModel from '../../model/common.model';

const ApiResultExecutor = (
   response: commonModel.Message
  ,showSuccessMessage = false
  ,nextCodesWhenSuccess?: () => void
) => {
  
  if (response) {
    if (response.msId) {
      if (showSuccessMessage) {
        alert(response.msContent);
      }

      if (nextCodesWhenSuccess) {
        nextCodesWhenSuccess();
      }
    } else {
      console.log(response.msObject);
      alert(response.msContent);
    }
  } else {
    alert('fail');
  }
};

export default ApiResultExecutor;