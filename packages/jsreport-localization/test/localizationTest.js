const should = require('should')
const jsreport = require('@jsreport/jsreport-core')

describe('localization', () => {
  let reporter

  beforeEach(() => {
    reporter = jsreport()
      .use(require('@jsreport/jsreport-assets')())
      .use(require('@jsreport/jsreport-handlebars')())
      .use(require('../')())

    return reporter.init()
  })

  afterEach(() => reporter.close())

  it('should throw when passing invalid path', async () => {
    await reporter.documentStore.collection('folders').insert({
      name: 'localization',
      shortid: 'localization'
    })

    await reporter.documentStore.collection('assets').insert({
      name: 'en.json',
      content: Buffer.from(JSON.stringify({
        message: 'Hello'
      })),
      folder: {
        shortid: 'localization'
      }
    })

    should(reporter.render({
      template: {
        content: "{{localize 'message' 'does-not-exists'}}",
        engine: 'handlebars',
        recipe: 'html'
      },
      options: {
        language: 'en'
      }
    })).be.rejectedWith('couldn\'t find asset with data at does-not-exists/')
  })

  it('should provide localize helper', async () => {
    await reporter.documentStore.collection('folders').insert({
      name: 'localization',
      shortid: 'localization'
    })

    await reporter.documentStore.collection('assets').insert({
      name: 'en.json',
      content: Buffer.from(JSON.stringify({
        message: 'Hello'
      })),
      folder: {
        shortid: 'localization'
      }
    })

    const res = await reporter.render({
      template: {
        content: "{{localize 'message' 'localization'}}",
        engine: 'handlebars',
        recipe: 'html'
      },
      options: {
        language: 'en'
      }
    })
    res.content.toString().should.be.eql('Hello')
  })

  it('should provide localize helper with absolute path', async () => {
    await reporter.documentStore.collection('folders').insert({
      name: 'afolder',
      shortid: 'afolder'
    })

    await reporter.documentStore.collection('templates').insert({
      content: "{{localize 'message' '/localization'}}",
      engine: 'handlebars',
      recipe: 'html',
      name: 'template',
      folder: {
        shortid: 'afolder'
      }
    })

    await reporter.documentStore.collection('folders').insert({
      name: 'localization',
      shortid: 'localization'
    })

    await reporter.documentStore.collection('assets').insert({
      name: 'en.json',
      content: Buffer.from(JSON.stringify({
        message: 'Hello'
      })),
      folder: {
        shortid: 'localization'
      }
    })

    const res = await reporter.render({
      template: {
        name: 'template'
      },
      options: {
        language: 'en'
      }
    })
    res.content.toString().should.be.eql('Hello')
  })

  it('should provide localize helper with path relative to the current template', async () => {
    await reporter.documentStore.collection('folders').insert({
      name: 'afolder',
      shortid: 'afolder'
    })

    await reporter.documentStore.collection('templates').insert({
      content: "{{localize 'message' 'localization'}}",
      engine: 'handlebars',
      recipe: 'html',
      name: 'template',
      folder: {
        shortid: 'afolder'
      }
    })

    await reporter.documentStore.collection('folders').insert({
      name: 'localization',
      shortid: 'localization',
      folder: {
        shortid: 'afolder'
      }
    })

    await reporter.documentStore.collection('assets').insert({
      name: 'en.json',
      content: Buffer.from(JSON.stringify({
        message: 'Hello'
      })),
      folder: {
        shortid: 'localization'
      }
    })

    const res = await reporter.render({
      template: {
        name: 'template'
      },
      options: {
        language: 'en'
      }
    })
    res.content.toString().should.be.eql('Hello')
  })

  it('should provide localize helper with path relative to the current template ("../")', async () => {
    await reporter.documentStore.collection('folders').insert({
      name: 'afolder',
      shortid: 'afolder'
    })

    await reporter.documentStore.collection('templates').insert({
      content: "{{localize 'message' '../localization'}}",
      engine: 'handlebars',
      recipe: 'html',
      name: 'template',
      folder: {
        shortid: 'afolder'
      }
    })

    await reporter.documentStore.collection('folders').insert({
      name: 'localization',
      shortid: 'localization'
    })

    await reporter.documentStore.collection('assets').insert({
      name: 'en.json',
      content: Buffer.from(JSON.stringify({
        message: 'Hello'
      })),
      folder: {
        shortid: 'localization'
      }
    })

    const res = await reporter.render({
      template: {
        name: 'template'
      },
      options: {
        language: 'en'
      }
    })
    res.content.toString().should.be.eql('Hello')
  })

  it('should provide localize helper with path to the current template directory (".")', async () => {
    await reporter.documentStore.collection('templates').insert({
      content: "{{localize 'message' '.'}}",
      engine: 'handlebars',
      recipe: 'html',
      name: 'template'
    })

    await reporter.documentStore.collection('assets').insert({
      name: 'en.json',
      content: Buffer.from(JSON.stringify({
        message: 'Hello'
      }))
    })

    const res = await reporter.render({
      template: {
        name: 'template'
      },
      options: {
        language: 'en'
      }
    })
    res.content.toString().should.be.eql('Hello')
  })

  it('should provide localize helper with path to the current template directory ("." in folder)', async () => {
    await reporter.documentStore.collection('folders').insert({
      name: 'afolder',
      shortid: 'afolder'
    })

    await reporter.documentStore.collection('templates').insert({
      content: "{{localize 'message' '.'}}",
      engine: 'handlebars',
      recipe: 'html',
      name: 'template',
      folder: {
        shortid: 'afolder'
      }
    })

    await reporter.documentStore.collection('assets').insert({
      name: 'en.json',
      content: Buffer.from(JSON.stringify({
        message: 'Hello'
      })),
      folder: {
        shortid: 'afolder'
      }
    })

    const res = await reporter.render({
      template: {
        name: 'template'
      },
      options: {
        language: 'en'
      }
    })
    res.content.toString().should.be.eql('Hello')
  })
})
