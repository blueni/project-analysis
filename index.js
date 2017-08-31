#!/usr/bin/env node

const path = require( 'path' )
const fs = require( 'fs' )
const { iterateFiles } = require( './util.js' )
const Argv = require( './argv.js' )
const Analysis = require( './analysis.js' )

let config = {
    version: {
        short: 'v',
        description: '版本',
        operate( value ){
            console.log( 'v1.0.0' )
        }
    },

    includes: {
        short: 'i',
        description: '包含文件',
        operate( ...values ){
            let includes = this.includes
            values.forEach( value => {
                // value = path.join( process.cwd(), value )
                includes.push( value )
            })
        }
    },

    excludes: {
        description: '排除文件',
        operate( ...values ){
            let excludes = this.excludes
            values.forEach( value => {
                // value = path.join( process.cwd(), value )
                excludes.push( value )
            })
        }
    },

    lines: {
        short: 'l',
        description: '统计项目代码总行数'
    },

    help: {
        short: 'h',
        description: '显示这些信息',
        operate(){
            let str = ''
            let option
            for( let cmd in config ){
                option = config[cmd]
                if( option.short ){
                    str += ` -${option.short},`
                }
                str += ` --${cmd}: ${option.description}\n`
            }
            console.log( str )
        }
    }

}

let argv = new Argv( config, process.argv.slice( 2 ) )

let analysis = new Analysis( argv )
analysis.run()
