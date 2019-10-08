/////////////////////////////////////////////////////////
// Initialize viewer environment
//
/////////////////////////////////////////////////////////
function initialize(options) {

    return new Promise(function (resolve, reject) {

        Autodesk.Viewing.Initializer(options,
            function () {

                resolve()

            }, function (error) {

                reject(error)
            })
    })
}

/////////////////////////////////////////////////////////
// load document from URN
//
/////////////////////////////////////////////////////////
function loadDocument(urn) {

    return new Promise(function (resolve, reject) {

        var paramUrn = !urn.startsWith("urn:")
            ? "urn:" + urn
            : urn

        Autodesk.Viewing.Document.load(paramUrn,
            function (doc) {

                resolve(doc)

            }, function (error) {
                console.log("eere", error)
                reject(error)
            })
    })
}

/////////////////////////////////////////////////////////
// Get viewable items from document
//
/////////////////////////////////////////////////////////
function getViewableItems(doc, roles) {

    var rootItem = doc.getRootItem()

    var items = []

    var roleArray = roles
        ? (Array.isArray(roles) ? roles : [roles])
        : []

    roleArray.forEach(function (role) {

        var subItems =
            Autodesk.Viewing.Document.getSubItemsWithProperties(
                rootItem, {type: "geometry", role: role}, true)

        items = items.concat(subItems)
    })

    return items
}

/////////////////////////////////////////////////////////
// get query parameter
//
/////////////////////////////////////////////////////////
function getQueryParam(name, url) {

    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/*
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
}*/


function userFunction(pdb) {
    const res = {};

    return "Msg send from pbd";
}


function getAllLeafComponents(model) {
    return new Promise(resolve => {
        var cbCount = 0; // count pending callbacks
        var components = []; // store the results
        var tree; // the instance tree

        function getLeafComponentsRec(parent) {
            cbCount++;
            if (tree.getChildCount(parent) != 0) {
                tree.enumNodeChildren(parent, function (children) {
                    getLeafComponentsRec(children);
                }, false);
            } else {
                components.push(parent);
            }
            if (--cbCount == 0) resolve(components);
        }

        model.getObjectTree(function (objectTree) {
            tree = objectTree;
            var allLeafComponents = getLeafComponentsRec(tree.getRootId());
        });
    })
}

let getProps = (m, i, attrname) => {
    return new Promise((resolve) => {
        m.getProperties(i, (props) => {

            for (let j = 0; j < props.properties.length; j++) {
                let prop = props.properties[j];

                if (prop && prop.displayName.trim().toLowerCase() === attrname.trim().toLowerCase()) {
                    resolve({id: props.dbId, value: prop.displayValue})
                }
            }
            resolve({id: -1, value: ""})
        })
    })
}

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

window.getValues = (m, attributeName) => {
    const proms = [];
    const res = {};
    return getAllLeafComponents(m)
        .then((ids) => {
            for (let i = 0; i < ids.length; i++) {
                proms.push(getProps(m, ids[i], attributeName));
            }
            return Promise.all(proms)
                .then(result => {

                    for (let i = 0; i < result.length; i++) {
                        if (result[i].id !== -1) {
                            let date = new Date(convertDate( result[i].value )).getTime();
                            if (!res.hasOwnProperty(date))
                                res[date] = [];
                            res[date].push(result[i].id);
                        }

                    }
                    return res;
                });
        })
}
/////////////////////////////////////////////////////////
// Initialize Environment
//
/////////////////////////////////////////////////////////
window.initViewer = (urn) => {
    return new Promise((resolve, reject) => {
        return initialize({

            acccessToken: getQueryParam("acccessToken"),
            env: "AutodeskProduction"

        }).then(function (e) {

            loadDocument("urn:" + urn)
                .then(function (doc) {

                    var items = getViewableItems(doc, ["3d", "2d"])

                    var path = doc.getViewablePath(items[0])

                    var viewerDiv = document.getElementById("viewer")

                    var viewer = getQueryParam("showToolbar")
                        ? new Autodesk.Viewing.Private.GuiViewer3D(viewerDiv)
                        : new Autodesk.Viewing.Viewer3D(viewerDiv)

                    var onLoad = (m) => {
                        console.log(m.model)
                        viewer.removeEventListener()
                    }
                    onLoad = onLoad.bind(this);
                    viewer.addEventListener(
                        Autodesk.Viewing.GEOMETRY_LOADED_EVENT, onLoad
                    );

                    viewer.start(path, {}, (m) => {
                        viewer.removeEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, onLoad);
                        resolve(m);
                    })
                })
                .catch((e) => {
                    reject(e);
                    console.log("je crois que cest bizate", e)
                })
        }).catch(e => {
            reject(e);
            console.error(e)
        })
    })

}