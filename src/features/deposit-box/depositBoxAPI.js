// A mock function to mimic making an async request for data
export async function tryValidateMasterCode(password) {
  try {
    const url = `https://9w4qucosgf.execute-api.eu-central-1.amazonaws.com/default/CR-JS_team_M02a?code=${password}`;
    // console.log({ url });
    const res = await fetch(url);
    const validationData = await res.json();

    return validationData;
  } catch (error) {
    console.log(error);
    return null;
  }
}
