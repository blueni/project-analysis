const fs = require( 'fs' )
const path = require( 'path' )
const readline = require('readline')

const _tempOut = fs.createWriteStream( path.join( process.cwd(), '../_template.tmpl' ) )

const util = {

    _tempOut,

    iterateFiles( dir, cb, finished){
        let count = sum = 0
        _iterate( dir, cb )

        function _iterateDeepDir( dir, files, cb ){
            files.forEach( file => {
                let stats = fs.statSync( path.join( dir , file ) )
                if( !stats.isDirectory() ){
                    return
                }
                let res = cb( dir );
                if( res === false ){
                    return
                }
                if( res && res.then ){
                    res.then( () => {
                        _iterate( path.join( dir , file ) , cb );
                    })
                }else{
                    _iterate( path.join( dir , file ) , cb );
                }
            })
        }

        function _iterate( dir, cb ){
        	fs.readdir( dir , ( err, files ) => {
                let _count = _sum = 0
                files.forEach( file => {
                    let stats = fs.statSync( path.resolve( dir , file ) );
                    if( !stats.isDirectory() ){
                        let res = cb( dir , file );
                        if( res === false ){
                            return
                        }
                        count++
                        _count++
                        if( res && res.then ){
                            res.then( () => {
                                sum++
                                _sum++
                                if( _sum == _count ){
                                    _iterateDeepDir( dir, files, cb )
                                }
                                if( sum == count ){
                                    finished( sum )
                                }
                            })
                        }else{
                            setTimeout(() => {
                                sum++
                                _sum++
                                if( _sum == _count ){
                                    _iterateDeepDir( dir, files, cb )
                                }
                                if( sum == count ){
                                    finished( sum )
                                }
                            })
                        }
                    }
                });
            })
        }
    },

    readFileLines( file ){
        let _tempOut = fs.createWriteStream( path.join( process.cwd(), '../_template.tmpl' ) )
        let stream = fs.createReadStream( file )
        let rl = readline.createInterface({
          input: stream
        })

        let lines = 0

        function _listener( line ){
            lines++
        }

        return new Promise( resolve => {
            rl.on( 'line', _listener )
            stream.pipe( _tempOut )
            stream.on( 'end', () => {
                setTimeout( () => {
                    stream.close()
                    _tempOut.close()
                    resolve( lines )
                    rl.removeListener( 'line', _listener )
                    rl.close()
                    rl = null
                })
            })
        })
    },

    pathTest( rules, filePath ){

        if( typeof rules === 'string' ){
            return _test( rules, filePath )
        }

        for( let rule of rules ){
            if( _test( rule, filePath ) ){
                return true
            }
        }

        function _test( rule, filePath ){
            let reg, res
            if( rule.indexOf( '.' ) < 0 ){
                rule += '/'
            }
            rule = rule.replace( /[\\\/]+/g, '/' ).replace( '/', '\/' )
            filePath = filePath.replace( /[\\\/]+/g, '/' )
            if( rule.endsWith( '*.*' ) || rule.endsWith( '/' ) ){
                rule = rule.replace( /(?:*\.*)|\/$/, '.*$' )
                reg = new RegExp( rule )
                res = reg.test( filePath )
                return res
            }

            if( /\*\..+$/.test( rule ) ){
                rule = rule.replace( /\*\.(.+)$/, '[^\\\\\/]+\.$1$' )
                reg = new RegExp( rule )
                res = reg.test( filePath )
                return res
            }

            reg = new RegExp( rule )
            res = reg.test( filePath )
            return res
        }

    }

}

module.exports = util
