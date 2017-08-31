const fs = require( 'fs' )
const path = require( 'path' )
const readline = require('readline')

const _tempOut = fs.createWriteStream( path.join( process.cwd(), '../_template.tmpl' ) )

const util = {

    _tempOut,

    iterateFiles( dir, cb, finished){
        let count = sum = 0
        _iterate( dir )

        function _iterate( dir ){
        	fs.readdirSync( dir )
        		.forEach( file => {
        			let stats = fs.statSync( path.resolve( dir , file ) );
        			if( stats.isDirectory() ){
        				let res = cb( dir );
                        if( res === false ){
                            return
                        }
                        if( res && res.then ){
                            res.then( () => {
                                _iterate( path.resolve( dir , file ) , cb );
                            })
                        }else{
                            _iterate( path.resolve( dir , file ) , cb );
                        }
        			}else{
        				let res = cb( dir , file );
                        if( res === false ){
                            return
                        }
                        count++
                        if( res && res.then ){
                            res.then( () => {
                                sum++
                                if( sum == count ){
                                    finished( sum )
                                }
                            })
                        }else{
                            setTimeout( () => {
                                sum++
                                if( sum == count ){
                                    finished( sum )
                                }
                            })
                        }
        			}
        		});
        }
    },

    readFileLines( file ){
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
                    resolve( lines )
                    rl.removeListener( 'line', _listener )
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
            let reg
            if( rule.indexOf( '.' ) < 0 ){
                rule += '/'
            }
            rule = rule.replace( /[\\\/]+/g, '/' ).replace( '/', '\/' )
            filePath = filePath.replace( /[\\\/]+/g, '/' )
            if( rule.endsWith( '*.*' ) || rule.endsWith( '/' ) ){
                rule = rule.replace( /(?:*\.*)|\/$/, '.*$' )
                reg = new RegExp( rule )
                return reg.test( filePath )
            }

            if( /\*\..+$/.test( rule ) ){
                rule = rule.replace( /\*\.(.+)$/, '[^\\\\\/]+\.$1$' )
                reg = new RegExp( rule )
                return reg.test( filePath )
            }

            reg = new RegExp( rule )
            return reg.test( filePath )
        }
    }

}

module.exports = util
