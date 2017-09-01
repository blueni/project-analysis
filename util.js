const fs = require( 'fs' )
const path = require( 'path' )
const readline = require('readline')

let _tempFile = path.join( process.cwd(), '../_template.tmpl' )

const util = {

    _tempFile,

    iterateFiles( dir, cb, finished){
        let count = 0
        let sum = 0
        let hasMoreFile = false
        _iterate( dir, cb )

        function _iterateDeepDir( pDir, dirs, cb ){
            dirs.forEach( dir => {
                let res = cb( path.join( pDir, dir ) )

                if( res === false ){
                    return
                }
                if( res && res.then ){
                    res.then( ( data ) => {
                        if( data === false ){
                            return
                        }
                        _iterate( path.join( pDir , dir ) , cb );
                    })
                }else{
                    _iterate( path.join( pDir , dir ) , cb );
                }
            })

        }

        function _iterate( dir, cb ){
        	fs.readdir( dir , ( err, files ) => {
                let _count = 0
                let _sum = 0
                let file, dirs = []
                for( let i=0;i<files.length;i++ ){
                    file = files[i]
                    let stats = fs.statSync( path.resolve( dir , file ) );
                    if( stats.isDirectory() ){
                        dirs.push( file )
                        continue
                    }
                    let res = cb( dir , file );
                    if( res === false ){
                        continue
                    }
                    count++
                    _count++
                    if( res && res.then ){
                        res.then( () => {
                            sum++
                            _sum++
                            if( _sum == _count ){
                                _iterateDeepDir( dir, dirs, cb )
                            }
                            if( sum == count ){
                                finished( sum )
                            }
                        })
                    }else{
                        sum++
                        _sum++
                        if( _sum == _count ){
                            _iterateDeepDir( dir, dirs, cb )
                        }
                        setTimeout(() => {
                            if( sum == count ){
                                finished( sum )
                            }
                        })
                    }
                }
                if( _count == 0 ){
                    _iterateDeepDir( dir, dirs, cb )
                }
            })
        }
    },

    readFileLines( file ){
        let _tempStream = fs.createWriteStream( _tempFile )
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
            stream.pipe( _tempStream )
            stream.on( 'end', () => {
                setTimeout( () => {
                    stream.close()
                    _tempStream.close()
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
            if( !rule ){
                return false
            }
            let _rule = rule
            let reg, res
            let cwd = ( process.cwd() + '/' ).replace( /[\\\/]+/g, '/' )
            if( rule.indexOf( '.' ) < 0 ){
                rule += '/'
            }

            rule = rule.replace( /[\\\/]+/g, '/' )
                        .replace( /^\//, cwd )
                        .replace( /\*\*\//g, '.*?' )
                        .replace( /(?:(\*\.\*)|\/)$/, '/.*$' )
                        .replace( /\//g, '\\/' )

            rule = rule.replace( /\*\.([^*]+)$/, '[^\\\\\\\/]+\\.$1$' )


            filePath = filePath.replace( /[\\\/]+/g, '/' )

            reg = new RegExp( rule )
            res = reg.test( filePath )

            return res
        }

    }

}

module.exports = util
