const fs = require( 'fs' )
const path = require( 'path' )
const readline = require('readline')

let _tempFile = path.join( process.cwd(), '../_template.tmpl' )

const util = {

    _tempFile,

    iterateFiles( dir, cb, finished){
        let fileCount = 0
        let fileSyncCount = 0
        let dirCount = 0
        let dirSyncCount = 0
        
        _iterate( dir, cb )

        function _iterate( dir, cb ){
            dirSyncCount++

        	fs.readdir( dir , ( err, files ) => {
                let length = files.length
                let sum = 0                
                let file
                let isDir
                let promise

                if( !length ){
                    dirCount++
                }

                for( let i=0;i<length;i++ ){
                    file = path.join( dir , files[i] )
                    let stats = fs.statSync( file );
                    let isDir = stats.isDirectory( file )
                    let res = cb( file, isDir );

                    if( res && res.then ){
                        promise = res
                    }else{
                        promise = Promise.resolve()
                    }
                    if( res === false ){
                        fileCount--
                    }
                    if( isDir && res !== false ){
                        _iterate( file, cb )
                    }
                    promise.then( () => {
                        fileCount++
                        sum++
                        if( sum == length ){
                            dirCount++
                            if( dirCount === dirSyncCount ){
                                finished( fileCount, dirCount )
                            }
                        }
                    })
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
                        .replace( /\*\.([^*]+)$/, '[^\\\\\\\/]+\\.$1$' )

            filePath = filePath.replace( /[\\\/]+/g, '/' )

            reg = new RegExp( rule )
            res = reg.test( filePath )

            return res
        }

    }

}

module.exports = util
