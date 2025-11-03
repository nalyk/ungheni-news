/**
 * Decap CMS Custom Preview Template for Triunghi.md
 * Provides Hugo-like preview with validation warnings for editorial standards
 */

// News Article Preview Component
const NewsPreview = createClass({
  render: function() {
    const entry = this.props.entry;
    const widgetFor = this.props.widgetFor;
    const getAsset = this.props.getAsset;

    // Extract front matter data
    const title = entry.getIn(['data', 'title']);
    const summary = entry.getIn(['data', 'summary']);
    const categories = entry.getIn(['data', 'categories']);
    const formats = entry.getIn(['data', 'formats']);
    const date = entry.getIn(['data', 'date']);
    const authors = entry.getIn(['data', 'authors']);
    const cutiaUngheni = entry.getIn(['data', 'cutia_ungheni']);
    const cover = entry.getIn(['data', 'cover']);
    const body = widgetFor('body');

    // Validation: Check if Cutia Ungheni is required but missing
    const requiresCutia = categories && (
      categories.includes('national') ||
      categories.includes('ue-romania')
    );

    // Check for new simplified structure (content field) or old structure (backward compatible)
    const cutiaIsFilled = cutiaUngheni && (
      cutiaUngheni.get('content') ||
      cutiaUngheni.get('impact_local') ||
      cutiaUngheni.get('ce_se_schimba') ||
      cutiaUngheni.get('termene')
    );

    const showCutiaWarning = requiresCutia && !cutiaIsFilled;

    // Format labels
    const formatLabels = {
      'stire': 'Știre',
      'analiza': 'Analiză',
      'explainer': 'Explainer',
      'opinie': 'Opinie',
      'factcheck': 'Fact-check'
    };

    const categoryLabels = {
      'local': 'Local Ungheni',
      'frontiera-transport': 'Frontieră & Transport',
      'economie-zel': 'Economie & ZEL',
      'servicii-publice': 'Servicii Publice',
      'educatie-sanatate': 'Educație & Sănătate',
      'national': 'Național',
      'ue-romania': 'UE & România'
    };

    return h('div', {className: 'triunghi-preview'},
      // Validation warnings at top
      showCutiaWarning && h('div', {className: 'validation-warning validation-error'},
        h('div', {className: 'warning-icon'}, '⚠️'),
        h('div', {className: 'warning-content'},
          h('strong', {}, 'CUTIA UNGHENI LIPSEȘTE!'),
          h('p', {}, 'Acest articol are categoria "' + (categories && categories.first()) + '" dar secțiunea "Cutia Ungheni" nu este completată. Acest lucru este OBLIGATORIU conform politicii editoriale.'),
          h('p', {}, 'Scroll jos și completează cel puțin unul din câmpurile: Impact Local, Ce se schimbă, sau Termene.')
        )
      ),

      // Article metadata
      h('div', {className: 'article-meta'},
        formats && h('span', {className: 'format-badge format-' + formats.first()},
          formatLabels[formats.first()] || formats.first()
        ),
        categories && h('span', {className: 'category-badge category-' + categories.first()},
          categoryLabels[categories.first()] || categories.first()
        ),
        date && h('time', {className: 'article-date'},
          new Date(date).toLocaleDateString('ro-RO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        )
      ),

      // Article header
      h('header', {className: 'article-header'},
        title && h('h1', {className: 'article-title'}, title),
        summary && h('p', {className: 'article-summary'}, summary),
        authors && h('div', {className: 'article-authors'},
          'De: ',
          authors.map(author =>
            h('span', {className: 'author-name'}, author)
          ).toArray().reduce((acc, val, i, arr) =>
            arr.length - 1 === i ? [...acc, val] : [...acc, val, ', '],
            []
          )
        )
      ),

      // Cover image
      cover && h('figure', {className: 'article-cover'},
        h('img', {
          src: getAsset(cover).toString(),
          alt: entry.getIn(['data', 'cover_alt']) || title
        })
      ),

      // Article body
      h('article', {className: 'article-body'}, body),

      // Cutia Ungheni (if present)
      cutiaIsFilled && h('aside', {className: 'cutia-ungheni'},
        h('h2', {className: 'cutia-title'},
          cutiaUngheni.get('title') || 'De ce contează pentru Ungheni'
        ),
        // New simplified structure: single rich content field
        cutiaUngheni.get('content') && h('div', {
          className: 'cutia-content',
          dangerouslySetInnerHTML: {__html: cutiaUngheni.get('content')}
        }),
        // Backward compatibility: old multi-field structure
        !cutiaUngheni.get('content') && [
          cutiaUngheni.get('impact_local') && h('div', {className: 'cutia-section'},
            h('h3', {}, 'Impact Local'),
            h('p', {}, cutiaUngheni.get('impact_local'))
          ),
          cutiaUngheni.get('ce_se_schimba') && h('div', {className: 'cutia-section'},
            h('h3', {}, 'Ce se schimbă pentru locuitori'),
            h('p', {}, cutiaUngheni.get('ce_se_schimba'))
          ),
          cutiaUngheni.get('termene') && h('div', {className: 'cutia-section'},
            h('h3', {}, 'Termene importante'),
            h('p', {}, cutiaUngheni.get('termene'))
          ),
          cutiaUngheni.get('unde_aplici') && h('div', {className: 'cutia-section'},
            h('h3', {}, 'Unde aplici / Informații'),
            h('p', {}, cutiaUngheni.get('unde_aplici'))
          )
        ]
      ),

      // Additional validation info footer
      requiresCutia && h('div', {className: 'preview-info'},
        h('p', {},
          cutiaIsFilled
            ? '✅ Cutia Ungheni completată - articolul respectă politica editorială'
            : '❌ Atenție: Cutia Ungheni trebuie completată pentru această categorie'
        )
      )
    );
  }
});

// Register the preview template
CMS.registerPreviewTemplate('news_ro', NewsPreview);
CMS.registerPreviewTemplate('news_ru', NewsPreview);

// Helper to create React elements (shorthand)
const h = React.createElement;
const createClass = React.createClass;
