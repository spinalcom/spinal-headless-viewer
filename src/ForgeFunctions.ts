import  { AuthClientTwoLegged } from 'forge-apis'


// Fetch Forge token
export const getToken = () => {

    const scope = [
        'viewables:read'
    ];
    const oAuth2TwoLegged = new AuthClientTwoLegged(
        process.env.FORGE_CLIENT_ID,
        process.env.FORGE_CLIENT_SECRET,
        scope);

    return oAuth2TwoLegged.authenticate()
};


function convertDate( date ) {
    let d = '';
    if (date.length === 8) {
        d = date.substring( 0, 4 );
        d += '-';
        d += date.substring( 4, 6 );
        d += '-';
        d += date.substring( 6, 8 );
    }
    return d;
}

export  function filterDb( m, attributeName, attributeVal ) {
    const date = attributeVal.getTime()
    const fun = `
function userFunction( pdb ) {
  const res = [];
  let attrNameId = -1;
  
  function convertDate( date ) {
    let d = "";
    if (date.length === 8) {
      d = date.substring( 0, 4 );
      d += "-";
      d += date.substring( 4, 6 )
      d += "-";
      d += date.substring( 6, 8 )
    }
    return d;
  }
  
  pdb.enumAttributes( ( i, attrDef, attrRaw ) => {
    const { name } = attrDef;
    
    if (name.toLowerCase() === '${attributeName.toLowerCase()}') {
      attrNameId = i;
      return true;
    }
  } );
  
  pdb.enumObjects( ( dbId ) => {
    pdb.enumObjectProperties( dbId, ( attrId, valId ) => {
      if (attrId === attrNameId) {
        const value = pdb.getAttrValue( attrId, valId );
        if (value.length > 0) {
          let data = new Date(convertDate( value )).getTime()
          
          if (value.length > 0 && data < '${date}') {
            res.push( dbId );
          }
        }
        return true;
        
      }
    } );
  } );
  
  return { dbIds: res, attrId: attrNameId };
}`;

    return m.getPropertyDb().executeUserFunction( fun );
}



/**
 * Retrieve the value of attributeName for each dbIds
 * @param m {Model} Forge model
 * @param attributeName {String} name of the attribute to get the value of
 * @return {*}
 */
export  function getValues( m, attributeName) {
    const fun = `
function userFunction( pdb ) {
  const res = {};
  let attrNameId = -1;
  
  function convertDate( date ) {
    let d = "";
    if (date.length === 8) {
      d = date.substring( 0, 4 );
      d += "-";
      d += date.substring( 4, 6 );
      d += "-";
      d += date.substring( 6, 8 );
    }
    return d;
  }
  
  pdb.enumAttributes( ( i, attrDef, attrRaw ) => {
    const { name } = attrDef;
    
    if (name.toLowerCase() === '${attributeName.toLowerCase()}') {
      attrNameId = i;
      return true;
    }
  } );
  
  pdb.enumObjects( ( dbId ) => {
    pdb.enumObjectProperties( dbId, ( attrId, valId ) => {
      if (attrId === attrNameId) {
        const value = pdb.getAttrValue( attrId, valId );
        if (value.length > 0) {
          let date = new Date(convertDate( value )).getTime();
          if(isNaN(date)){
          }
          if (!res.hasOwnProperty( date ))
            res[date] = [];
          res[date].push(dbId)
        }
        return true;
        
      }
    } );
  } );
  
  return { dbIds: res, attrId: attrNameId };
}`;
    if (typeof m !== "undefined" && m !== null && typeof m.getPropertyDb() !== "undefined" && m.getPropertyDb() !== null)
        return m.getPropertyDb().executeUserFunction( fun );

    return Promise. resolve({ dbIds: [], attrId: -1 })
}