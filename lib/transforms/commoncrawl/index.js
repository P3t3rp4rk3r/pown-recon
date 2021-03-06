const querystring = require('querystring')
const { Scheduler } = require('@pown/request/lib/scheduler')

const { Transformer } = require('../../transformer')

const scheduler = new Scheduler()

const commoncrawlIndex = class extends Transformer {
    static get alias() {
        return ['commoncrawl_index', 'cci']
    }

    static get title() {
        return 'CommonCrawl Index'
    }

    static get description() {
        return 'Obtain a CommonCraw index for specific URL.'
    }

    static get types() {
        return ['domain', 'uri']
    }

    static get options() {
        return {}
    }

    static get noise() {
        return 100
    }

    async handle({ id: target = '', label = '' }, options) {
        const query = querystring.stringify({
            output: 'json',
            url: label.replace(/\/?$/, '/*')
        })

        // TODO: perform the same search but over multiple indexes

        const { responseBody } = await scheduler.fetch(`http://index.commoncrawl.org/CC-MAIN-2018-22-index?${query}`)

        const lines = responseBody.toString().trim().split('\n')

        return lines.map((line) => {
            const { url: uri, mime } = JSON.parse(line)

            return { type: 'uri', label: uri, props: { uri, mime }, edges: [target] }
        })
    }
}

module.exports = { commoncrawlIndex }
