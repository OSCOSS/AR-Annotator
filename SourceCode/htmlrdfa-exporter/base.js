import {
    DOMSerializer
} from "prosemirror-model"
import {
    BaseDOMExporter
} from "../exporter/tools/dom-export"
import {
    RenderCitations
} from "../citations/render"
import {
    docSchema
} from "../schema/document"
import {
    escapeText
} from "../common"
import {
    TAGS
} from "./tags"
import {
    commentHeaderTemplate,
    commentBodyTemplate,
    commentHeaderRDFaTemplate,
    commentBodyRDFaTemplate
} from "./templates"

export class BaseHTMLRDFaExporter extends BaseDOMExporter {
    joinDocumentParts() {
        let schema = docSchema
        schema.cached.imageDB = this.imageDB
        let serializer = DOMSerializer.fromSchema(schema)
        this.contents = serializer.serializeNode(docSchema.nodeFromJSON(
            this.doc.contents))
        // Remove hidden parts
        let hiddenEls = [].slice.call(this.contents.querySelectorAll(
            '[data-hidden=true]'))
        hiddenEls.forEach(hiddenEl => {
            hiddenEl.parentElement.removeChild(hiddenEl)
        })

        let citRenderer = new RenderCitations(
            this.contents,
            this.doc.settings.citationstyle,
            this.bibDB,
            this.citationStyles,
            this.citationLocales,
            true
        )
        return citRenderer.init().then(
            () => {
                this.addBibliographyHTML(citRenderer.fm.bibHTML)
                return Promise.resolve()
            }
        )
    }

    addBibliographyHTML(bibliographyHTML) {
        if (bibliographyHTML.length > 0) {
            let tempNode = document.createElement('div')
            tempNode.innerHTML = bibliographyHTML
            while (tempNode.firstChild) {
                this.contents.appendChild(tempNode.firstChild)
            }
        }
    }

    addFigureNumbers(dom) {

        jQuery(dom).find('figcaption .figure-cat-figure').each(
            function(index) {
                this.innerHTML += ' ' + (index + 1) + ': '
            })

        jQuery(dom).find('figcaption .figure-cat-photo').each(function(
            index) {
            this.innerHTML += ' ' + (index + 1) + ': '
        })

        jQuery(dom).find('figcaption .figure-cat-table').each(function(
            index) {
            this.innerHTML += ' ' + (index + 1) + ': '
        })
        return dom

    }


    converTitleToRDFa(dom) {
        
        jQuery(dom).find('div.article-title').attr({
            "property": "schema:name"
        })
        let titleTag = jQuery(dom).find('div.article-title').wrap(
            '<p/>').parent().html()
        titleTag = titleTag
            .replace(/<div/g, '<h1')
            .replace(/<\/div>/g, '</h1>')
        jQuery(dom).find('div.article-title').html(titleTag)
        jQuery(dom).find('p.h1.article-title').unwrap()


        return dom
    }

    convertCommentsToRDFa(htmlCode) {

        jQuery(htmlCode).find('span.comment').each(function() {
            let rect = this.getBoundingClientRect()
            let id = jQuery(this).attr('data-id')
            jQuery(this).attr({
                "rel": "schema:hasPart",
                "typeof": "dctypes:Text",
                "resource": `r-${id}`
            })
            let commentDescription = this.innerHTML,
                commentTag =
                    `<mark id="${id}" property="schema:description">
                        ${commentDescription}
                    </mark>`,
                suppTag =
                `<sup class="ref-annotation">
    		        <a rel="cito:hasReplyFrom" href="#${id}"
                                resource="${window.location.href}/comment-${id}">
       		              💬
                    </a>
                </sup>`
            jQuery(this).html(commentTag + suppTag)
            jQuery(this).addClass("ref do")

        })
        return htmlCode
    }



    createComment(commentNode) {
        let commentHeader = commentHeaderTemplate({commentNode, href: window.location.href}),
            commentBody = commentBodyTemplate({commentNode, href: window.location.href}),
            commentEnd = '</article></main></body></html>'

        return {
            filename: `comment#${commentNode.id}.html`,
            contents: commentHeader + commentBody + commentEnd
        }
    }

    converAuthorsToRDFa(dom) {

        jQuery(dom).find('div.article-authors').attr({
            "id": "authors"
        })


        let className
        jQuery(dom).find('span.author').each(function(index) {
            if (this.classList !== null && this.innerHTML !== null) {
                className = new DOMParser().parseFromString(this.innerText, 'text/html').body.textContent || "";
                className = escapeText(className.replace(/\s+/g, ''))
                this.classList.add(className)
                this.id = className
                this.outerHTML =
                    `<dd id="${className}" rel="bibo:authorList" resource="#${className}">
                        <span rel="schema:creator schema:publisher schema:author" typeof="schema:person">
                            ${this.innerHTML}
                        </span>
                    </dd>`
            }
        })

        return dom
    }

    convertAbstractToRDF(dom) {
        let abstractEl = jQuery(dom).find('div.article-abstract')
        if (!abstractEl.length) {
            return dom
        }
        abstractEl.attr({
            "datatype": "rdf:HTML",
            "property": "schema:abstract"
        })
        let abstractSection = abstractEl.wrap('<p/>').parent().html()
        abstractSection = abstractSection
            .replace(/<div/g, '<section id="Abstract"')
            .replace(/<\/div>/g, '</section>')
        jQuery(dom).find('div.article-abstract').parent().html(
            abstractSection)
        jQuery(dom).find('div.article-abstract').unwrap()
        jQuery(dom).find('div.article-content').unwrap()
        return dom
    }

    convertSideCommentsToRDFa(htmlCode, comments, sidetagList) {
        jQuery(htmlCode).find('.comment').each(function() {
            let sidetags,
                id = jQuery(this).attr('data-id')
            if (id != null && comments[id] != null && id != "" &&
                comments != null && sidetagList != null &&
                sidetagList.constructor == Array) {
                let commentNode = comments[id],
                    commentHeader = commentHeaderRDFaTemplate({commentNode, href: window.location.href}),
                    commentBody = commentBodyRDFaTemplate({commentNode, href: window.location.href})

                sidetags = commentHeader + commentBody
                let sideTagNode = document.createElement('aside')
                sideTagNode.classList.add('note')
                sideTagNode.classList.add('do')
                sideTagNode.innerHTML =
                    `<blockquote cite="${commentNode.id}">${sidetags}<br/><br/></blockquote>`
                sidetagList.push(sideTagNode)
            }
        })
        return htmlCode
    }

    adjustSections(htmlCode, sidetagList) {

        jQuery(htmlCode).find('section').each(function(index) {

            let next = this.nextSibling,
                divNode = jQuery(this).find(
                    'div[datatype="rdf:HTML"]')[0]
            if (divNode) {
                while (next && next.localName != 'section') {
                    this.parentNode.removeChild(next)
                    divNode.appendChild(next)
                    next = this.nextSibling
                    if (!next) {
                        break
                    }
                }
            } else {
                while (next && next.localName != 'section') {
                    this.parentNode.removeChild(next)
                    this.appendChild(next)
                    next = this.nextSibling
                    if (!next) {
                        break
                    }
                }
            }
        })
        if (sidetagList.length > 0) {
            jQuery(htmlCode).find('section').each(function() {
                let tags = []
                jQuery(this).find('span.comment').each(function() {
                    for (let i = 0; i < sidetagList.length; i++) {
                        if (sidetagList[i].innerHTML.includes(
                                jQuery(this).attr('data-id')
                            )) {
                            tags.push(sidetagList[i])
                        }
                    }
                })
                if (tags.length > 0) {
                    for (let i = 0; i < tags.length; i++) {
                        this.appendChild(tags[i])
                    }
                }
            })

            jQuery(htmlCode).each(function() {
                let script = document.createElement('script')
                script.innerHTML =
                    `jQuery( document ).ready(function() {
    			        jQuery(this).find('span.comment').each(function () {
                            var id=jQuery(this).attr('data-id');
                            var top=jQuery(this).offset().top - 40;
                            jQuery(document).find('article[id="'+id+'"]').each(function () {
                                jQuery(this).css('top',top);
                            });
                        });
                    });`
                this.appendChild(script)
            })

        }
        return htmlCode
    }

    addSectionsTag(dom) {
        
        let className, rdfaType

        jQuery(dom).find('h3').each(function(index) {
            
            if (this.classList !== null && this.innerHTML !== null) {
                className = new DOMParser().parseFromString(this.innerText, 'text/html').body.textContent || "";
                className = escapeText(className.replace(/\s+/g, ''))
                if (className !== null && className !== "") {
                    this.classList.add(className)
                    this.id = className
                    this.outerHTML =
                        `<section id="${className}" resource="#${className}">
                            <h4 property="schema:name">${this.innerHTML}</h4>
                        </section>`
                }
            }
        })

        jQuery(dom).find('h2').each(function(index) {
            
            if (this.classList !== null && this.innerHTML !== null) {
                className = new DOMParser().parseFromString(this.innerText, 'text/html').body.textContent || "";
                className = escapeText(className.replace(/\s+/g, ''))
                if (className !== null && className !== "") {
                    this.classList.add(className)
                    this.id = className
                    this.outerHTML =
                        `<section id="${className}" inlist="" resource="#${className}">
                            <h3 property="schema:name">${this.innerHTML}</h3>
                        </section>`
                }
            }
        })

        jQuery(dom).find('h1').each(function(index) {
            
            if (this.classList !== null && this.innerHTML !== null) {
                className = new DOMParser().parseFromString(this.innerText, 'text/html').body.textContent || "";
                className = escapeText(className.replace(/\s+/g, ''))
                if (className !== null && className !== "") {
                    //Titles are also H1 in FW, which have not class names
                    this.classList.add(className)
                    this.id = className

                    let tagger = TAGS.find(def => new RegExp(def.texts.join("|"), 'i').test(className))
                    let tag = tagger ? tagger.tag : ''

                    this.outerHTML =
                        `<section id="${className}" inlist="" rel="schema:hasPart" resource="#${className}">
                            <h2 property="schema:name">${this.innerHTML}</h2>
			                <div datatype="rdf:HTML" property="schema:description" resource="#${className}" typeof="${tag}">
			                </div>
                    	</section>`
                }
            }
        })

        return dom
    }


    addRefeneceRDFa(dom) {
        jQuery(dom).find('div.csl-bib-body').each(function(index) {
            if (this.innerHTML !== null) {
                this.outerHTML =
                    `<section id="references">
			            <h2>References</h2>
                        <div datatype="rdf:HTML" rel="schema:hasPart" typeof="deo:Reference">
                            <ol>${this.innerHTML}</ol>
			            </div>
                    </section>`
            }
        })
        return dom
    }

    addRefeneces(htmlString) {

        let referenceEl = jQuery(htmlString).find('div.csl-entry')

        if (!referenceEl.length) {
            return htmlString
        }
        referenceEl.attr({
            "typeof": "deo:BibliographicReference"
        })
        jQuery(htmlString).find('div.csl-entry').each(function(index) {
            if (this.innerHTML !== null) {
                this.outerHTML =
                    `<li><cite>${this.innerHTML}</cite></li>`
            }
        })
        return htmlString
    }


    replaceImgSrc(htmlString) {
        htmlString = htmlString.replace(/<(img|IMG) data-src([^>]+)>/gm,
            "<$1 src$2/>")
        return htmlString
    }

    cleanUpAttributes(htmlString){
        var footnotes = jQuery(htmlString).find("[data-footnote]")
        for(var i = 0; i < footnotes.length; i++){
            footnotes[i].dataset.footnote = new DOMParser().parseFromString(footnotes[i].dataset.footnote, 'text/html').body.textContent || "";
            footnotes[i].innerText = ""
        }

        
        var ids = jQuery(htmlString).find("[id]")
        for(var i = 0; i < ids.length; i++){
            ids[i].id = new DOMParser().parseFromString(ids[i].id, 'text/html').body.textContent || "";
        }

        return htmlString
    }

    cleanUpTags(htmlString){
        htmlString = htmlString.replace(/(<img("[^"]*"|[^\/">])*)>/gi, "$1/>");
        htmlString = htmlString.replace(/(<br("[^"]*"|[^\/">])*)>/gi, "$1/>");
        htmlString = htmlString.replace(/&nbsp;/g, " ");

        return htmlString
    }
}
