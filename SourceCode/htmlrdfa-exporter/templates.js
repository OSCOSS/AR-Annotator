import {escapeText} from "../common"
/** A template for HTML+RDFa export of a document. Using dokieli template */
export let htmlExportTemplate = ({title, styleSheets, part, contents}) =>
`<!DOCTYPE html>
<html>
    <head>
        <title>${escapeText(title)}</title>
        ${
            styleSheets.map(item =>
                `\t<link rel="stylesheet" type="text/css" href="${item.filename}" />`
            ).join('')
        }
        <meta charset="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <link href="https://dokie.li/media/css/basic.css" media="all" rel="stylesheet" title="Basic" />
        <link disabled="" href="https://dokie.li/media/css/lncs.css" media="all" rel="stylesheet alternate" title="LNCS" />
        <link href="https://dokie.li/media/css/acm.css" media="all" rel="stylesheet" title="ACM" />
        <link href="https://dokie.li/media/css/do.css" media="all" rel="stylesheet" />
        <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" media="all" rel="stylesheet" />
        <script src="https://dokie.li/scripts/simplerdf.js"></script>
        <script src="https://dokie.li/scripts/medium-editor.min.js"></script>
        <script src="https://dokie.li/scripts/do.js"></script><script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    </head>
	<body about="" id="article" typeof="schema:ScholarlyArticle sioc:Post prov:Entity foaf:Document sioc:Post biblio:Paper bibo:Document as:Article" prefix="rdf: http://www.w3.org/1999/02/22-rdf-syntax-ns# rdfs: http://www.w3.org/2000/01/rdf-schema# owl: http://www.w3.org/2002/07/owl# xsd: http://www.w3.org/2001/XMLSchema# dcterms: http://purl.org/dc/terms/ dctypes: http://purl.org/dc/dcmitype/ foaf: http://xmlns.com/foaf/0.1/ v: http://www.w3.org/2006/vcard/ns# pimspace: http://www.w3.org/ns/pim/space# cc: https://creativecommons.org/ns# skos: http://www.w3.org/2004/02/skos/core# prov: http://www.w3.org/ns/prov# qb: http://purl.org/linked-data/cube# schema: http://schema.org/ void: http://rdfs.org/ns/void# rsa: http://www.w3.org/ns/auth/rsa# cert: http://www.w3.org/ns/auth/cert# cal: http://www.w3.org/2002/12/cal/ical# wgs: http://www.w3.org/2003/01/geo/wgs84_pos# org: http://www.w3.org/ns/org# biblio: http://purl.org/net/biblio# bibo: http://purl.org/ontology/bibo/ book: http://purl.org/NET/book/vocab# ov: http://open.vocab.org/terms/ sioc: http://rdfs.org/sioc/ns# doap: http://usefulinc.com/ns/doap# dbr: http://dbpedia.org/resource/ dbp: http://dbpedia.org/property/ sio: http://semanticscience.org/resource/ opmw: http://www.opmw.org/ontology/ deo: http://purl.org/spar/deo/ doco: http://purl.org/spar/doco/ cito: http://purl.org/spar/cito/ fabio: http://purl.org/spar/fabio/ oa: http://www.w3.org/ns/oa# as: https://www.w3.org/ns/activitystreams# ldp: http://www.w3.org/ns/ldp# solid: http://www.w3.org/ns/solid/terms# acl: http://www.w3.org/ns/auth/acl# dio: https://w3id.org/dio#">
        <main>
            <article about="" typeof="schema:Article">
	  	        <div class="article-content" id="content">
                    ${
                        part && part.length ?
                        `<section id="part">
                		    <h2 class="part">${escapeText(part)}</h2>
      			        </section>` :
                        ''
                    }
                    ${contents}
			    </div>
			</article>
		</main>
	</body>
</html>`

export let commentHeaderTemplate = ({href, commentNode}) =>
`<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
    <head>
        <meta http-equiv="content-type" content="text/html; charset=UTF-8">
        <meta charset="utf-8">
        <title>${href}#${commentNode.id}</title>
    </head>
    <body>
        <main>
            <article id="${commentNode.id}" about="i:" typeof="oa:Annotation"
                    prefix="rdf: http://www.w3.org/1999/02/22-rdf-syntax-ns# schema: http://schema.org/ dcterms: http://purl.org/dc/terms/ oa: http://www.w3.org/ns/oa# as: https://www.w3.org/ns/activitystreams# i: ${href}#${commentNode.id}">
`

export let commentHeaderRDFaTemplate = ({href, commentNode}) =>
`<article id="${commentNode.id}" about="i:" typeof="oa:Annotation"
        prefix="rdf: http://www.w3.org/1999/02/22-rdf-syntax-ns# schema: http://schema.org/ dcterms: http://purl.org/dc/terms/ oa: http://www.w3.org/ns/oa# as: https://www.w3.org/ns/activitystreams# i: ${
            `${href}#${commentNode.id}`
        }"
>`

export let commentBodyTemplate = ({commentNode, href}) =>
`<h1 property="schema:name">
    ${escapeText(commentNode.userName)}
    <span rel="oa:motivatedBy" resource="oa:replying">replies</span>
</h1>
<dl class="author-name">
    <dt>Authors</dt>
    <dd>
        <span rel="schema:creator">
            <span about="userURI#${commentNode.user}" typeof="schema:Person">
                <img alt="" rel="schema:image" src="${commentNode.userAvatar}" width="48" height="48"/>
                <a href="#">
                    <span about="userURI#${commentNode.user}" property="schema:name">
                        ${escapeText(commentNode.userName)}
                    </span>
                </a>
            </span>
        </span>
    </dd>
</dl>
<dl class="published">
    <dt>Published</dt>
    <dd>
        <a href="${href}#${commentNode.id}">
            <time datetime="${commentNode.date}" datatype="xsd:dateTime"
                    property="schema:datePublished" content="${commentNode.date}">
                ${commentNode.date}
            </time>
        </a>
    </dd>
</dl>
<section id="comment-${commentNode.id}" rel="oa:hasBody"
        resource="i:#comment-${commentNode.id}">
    <h2 property="schema:name">Comment</h2>
    <div datatype="rdf:HTML" property="rdf:value schema:description"
            resource="i:#comment-${commentNode.id}" typeof="oa:TextualBody">
        ${commentNode.comment}
    </div>
</section>
<br/>
<br/>
${
    commentNode.answers.map(answer =>
        `<h2 property="schema:name">Answers</h2>
        <br/>
        <br/>
        <dl class="author-name">
            <dt>Authors</dt>
            <dd>
                <span rel="schema:creator">
                    <span about="userURI#${answer.user}" typeof="schema:Person">
                        <img alt="" rel="schema:image" src="${answer.userAvatar}"
                                width="48" height="48"/>
                        <a href="#">
                            <span about="userURI#${answer.user}" property="schema:name">
                                ${escapeText(answer.userName)}
                            </span>
                        </a>
                    </span>
                </span>
            </dd>
        </dl>
        <dl class="published">
            <dt>Published</dt>
            <dd>
                <a href="${href}#${answer.id}">
                    <time datetime="${answer.date}" datatype="xsd:dateTime"
                            property="schema:datePublished" content="${answer.date}">
                        ${answer.date}
                    </time>
                </a>
            </dd>
        </dl>
        <section id="answer-${answer.id}" rel="oa:hasBody" resource="i:#answer-${answer.id}">
            <h2 property="schema:name">Answer</h2>
            <div datatype="rdf:HTML" property="rdf:value schema:description"
                    resource="i:#answer-${answer.id}" typeof="oa:TextualBody">
                ${escapeText(answer.answer)}
            </div>
        </section>`
    ).join('')
}`

export let commentBodyRDFaTemplate = ({commentNode, href}) =>
`<h3 property="schema:name" style="display:none">
    ${escapeText(commentNode.userName)}
    <span rel="oa:motivatedBy" resource="oa:replying">replies</span>
</h3>
<dl class="author-name"><dt>Authors</dt><dd><span rel="schema:creator">
    <span about="userURI#${commentNode.user}" typeof="schema:Person">
       <img alt="" rel="schema:image" src="${commentNode.userAvatar}" width="48" height="48"/>
       <a href="#"><span about="userURI#${commentNode.user}" property="schema:name">
           ${escapeText(commentNode.userName)}
       </a>
    </span>
</dl>
<dl class="published">
    <dt>Published</dt>
    <dd>
        <a href="${href}#${commentNode.id}">
            <time datetime="${commentNode.date}"
                    datatype="xsd:dateTime" property="schema:datePublished"
                    content="${commentNode.date}">
                ${commentNode.date}
            </time>
        </a>
    </dd>
</dl>
<section id="comment-${commentNode.id}" rel="oa:hasBody"
        resource="i:#comment-${commentNode.id}">
    <h2 property="schema:name">Comment</h2>
    <div datatype="rdf:HTML" property="rdf:value schema:description"
            resource="i:#comment-${commentNode.id}" typeof="oa:TextualBody">
        ${commentNode.comment}
    </div>
</section>
${
    commentNode.answers.map(answer =>
    `<h3 property="schema:name" style="display:none">
        Answers</h3>
    <dl class="author-name">
        <dt>Authors</dt>
        <dd>
            <span rel="schema:creator">
            <span about="userURI#${answer.user}" typeof="schema:Person">
            <img alt="" rel="schema:image" src="${answer.userAvatar}"
                    width="48" height="48"/>
            <a href="#">
                <span about="userURI#${answer.user}" property="schema:name">
                    ${escapeText(answer.userName)}
                </span>
            </a>
        </dd>
    </dl>
    <dl class="published">
        <dt>Published</dt>
        <dd>
            <a href="${href}#${answer.id}">
                <time datetime="${answer.date}" datatype="xsd:dateTime"
                        property="schema:datePublished" content="${answer.date}">
                        ${answer.date}
                </time>
            </a>
        </dd>
        <section id="answer-${answer.id}" rel="oa:hasBody"
                resource="i:#answer-${answer.id}">
            <h2 property="schema:name">Answer</h2>
            <div datatype="rdf:HTML" property="rdf:value schema:description"
                    resource="i:#answer-${answer.id}" typeof="oa:TextualBody">
                ${escapeText(answer.answer)}
            </div>
        </section>`
    ).join('')
}
`
