/**
 * Metadata - Machine-readable metadata embedded in an SVG drawing.
 *
 * Metadata follows the SVG standard: on build(), a Drawing serializes the
 * Metadata as `<title>` and `<desc>` child elements of the `<svg>` root, plus
 * one `<metadata>` element holding an RDF/XML block with Dublin Core (`dc:`)
 * and Creative Commons (`cc:`) terms, the same shape Inkscape writes and
 * reads. Generator settings are stored as JSON in a `vormen:` element inside
 * the same `<metadata>` block, so tools like exiftool extract the standard
 * fields without vormen-specific parsers.
 */
import type { Document, Element } from "jsdom";
import type { SettingsData } from "../settings/settings.ts";

const SVG_NS = "http://www.w3.org/2000/svg";
const RDF_NS = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const DC_NS = "http://purl.org/dc/elements/1.1/";
const CC_NS = "http://creativecommons.org/ns#";
const VORMEN_NS = "https://github.com/berkes/vormen";
const XMLNS_NS = "http://www.w3.org/2000/xmlns/";
const DCMI_STILL_IMAGE = "http://purl.org/dc/dcmitype/StillImage";

/**
 * Metadata - The metadata of a drawing: attribution, provenance and the
 * generator settings that produced it.
 *
 * Construct with MetadataBuilder; all fields are optional and empty by
 * default. Serialized by Drawing on build().
 */
export class Metadata {
  private _title: string;
  private _description: string;
  private _author: string;
  private _copyright: string;
  private _date: Date | null;
  private _url: string;
  private _license: string;
  private _keywords: string[];
  private _settings: SettingsData | null;

  /**
   * Create a new Metadata. Prefer MetadataBuilder, which supplies defaults
   * for every attribute.
   *
   * @param title Title of the work (dc:title, also the `<title>` element)
   * @param description Free-form description (dc:description, `<desc>`)
   * @param author Creator of the work (dc:creator)
   * @param copyright Copyright/rights statement (dc:rights)
   * @param date Creation date (dc:date, ISO 8601), or null for none
   * @param url Source URL of the work (dc:source)
   * @param license License, usually a URL (cc:license), or free text
   * @param keywords Subject keywords (dc:subject as rdf:Bag)
   * @param settings The settings that generated the drawing, stored as JSON
   * in the `vormen:` namespace, or null for none
   */
  constructor(
    title: string,
    description: string,
    author: string,
    copyright: string,
    date: Date | null,
    url: string,
    license: string,
    keywords: string[],
    settings: SettingsData | null,
  ) {
    this._title = title;
    this._description = description;
    this._author = author;
    this._copyright = copyright;
    this._date = date;
    this._url = url;
    this._license = license;
    this._keywords = [...keywords];
    this._settings = settings ? { ...settings } : null;
  }

  get title(): string {
    return this._title;
  }

  get description(): string {
    return this._description;
  }

  get author(): string {
    return this._author;
  }

  get copyright(): string {
    return this._copyright;
  }

  get date(): Date | null {
    return this._date;
  }

  get url(): string {
    return this._url;
  }

  get license(): string {
    return this._license;
  }

  get keywords(): string[] {
    return [...this._keywords];
  }

  get settings(): SettingsData | null {
    return this._settings ? { ...this._settings } : null;
  }

  /**
   * Values available to a Caption template: every metadata field as a string,
   * plus each generator setting under its own key (e.g. `{seed}`).
   */
  captionValues(): Record<string, string> {
    const values: Record<string, string> = {
      title: this._title,
      description: this._description,
      author: this._author,
      copyright: this._copyright,
      date: this._date ? this._date.toISOString().slice(0, 10) : "",
      url: this._url,
      license: this._license,
      keywords: this._keywords.join(", "),
    };
    if (this._settings) {
      for (const [key, value] of Object.entries(this._settings)) {
        values[key] = String(value);
      }
    }
    return values;
  }
}

/**
 * MetadataBuilder - Builds a Metadata one attribute at a time. Every method
 * returns the builder itself; build() returns the Metadata with all
 * attributes set, empty ones left at their defaults.
 */
export class MetadataBuilder {
  private _title = "";
  private _description = "";
  private _author = "";
  private _copyright = "";
  private _date: Date | null = null;
  private _url = "";
  private _license = "";
  private _keywords: string[] = [];
  private _settings: SettingsData | null = null;

  /**
   * Set the title of the work.
   * @param value Title (dc:title and the `<title>` element)
   */
  title(value: string): MetadataBuilder {
    this._title = value;
    return this;
  }

  /**
   * Set the free-form description of the work.
   * @param value Description (dc:description and the `<desc>` element)
   */
  description(value: string): MetadataBuilder {
    this._description = value;
    return this;
  }

  /**
   * Set the creator of the work.
   * @param value Author (dc:creator)
   */
  author(value: string): MetadataBuilder {
    this._author = value;
    return this;
  }

  /**
   * Set the copyright/rights statement.
   * @param value Copyright notice (dc:rights)
   */
  copyright(value: string): MetadataBuilder {
    this._copyright = value;
    return this;
  }

  /**
   * Set the creation date of the work.
   * @param value Date (dc:date, serialized as ISO 8601)
   */
  date(value: Date): MetadataBuilder {
    this._date = value;
    return this;
  }

  /**
   * Set the source URL of the work.
   * @param value URL (dc:source)
   */
  url(value: string): MetadataBuilder {
    this._url = value;
    return this;
  }

  /**
   * Set the license of the work.
   * @param value License URL (cc:license rdf:resource) or free text
   */
  license(value: string): MetadataBuilder {
    this._license = value;
    return this;
  }

  /**
   * Set the subject keywords of the work.
   * @param value Keywords (dc:subject as rdf:Bag of rdf:li)
   */
  keywords(value: string[]): MetadataBuilder {
    this._keywords = [...value];
    return this;
  }

  /**
   * Set the generator settings that produced the drawing, e.g. the seed.
   * Stored as JSON in the `vormen:` namespace so the artwork can be
   * reproduced later.
   * @param value The settings record of the drawing
   */
  settings(value: SettingsData): MetadataBuilder {
    this._settings = { ...value };
    return this;
  }

  /**
   * Build the Metadata with all attributes set.
   */
  build(): Metadata {
    return new Metadata(
      this._title,
      this._description,
      this._author,
      this._copyright,
      this._date,
      this._url,
      this._license,
      this._keywords,
      this._settings,
    );
  }
}

/**
 * Append the serialization of metadata to an `<svg>` element: a `<title>`
 * and `<desc>` child when set, and a `<metadata>` child with an RDF/XML block
 * (Dublin Core / Creative Commons, as Inkscape writes) plus the generator
 * settings as JSON in the `vormen:` namespace. The elements are prepended, so
 * they come before any drawn content. Empty fields are omitted; an empty
 * Metadata appends nothing.
 */
export function appendMetadata(svgNode: Element, metadata: Metadata): void {
  const doc = svgNode.ownerDocument;
  if (!doc) {
    throw new Error("Cannot append metadata: the SVG element has no document");
  }

  const hasRdfContent = metadata.title !== "" ||
    metadata.description !== "" ||
    metadata.author !== "" ||
    metadata.copyright !== "" ||
    metadata.date !== null ||
    metadata.url !== "" ||
    metadata.license !== "" ||
    metadata.keywords.length > 0 ||
    metadata.settings !== null;

  let metadataEl: Element | null = null;
  if (hasRdfContent) {
    metadataEl = doc.createElementNS(SVG_NS, "metadata");
    const rdf = doc.createElementNS(RDF_NS, "rdf:RDF");
    rdf.setAttributeNS(XMLNS_NS, "xmlns:rdf", RDF_NS);
    rdf.setAttributeNS(XMLNS_NS, "xmlns:dc", DC_NS);
    rdf.setAttributeNS(XMLNS_NS, "xmlns:cc", CC_NS);
    rdf.setAttributeNS(XMLNS_NS, "xmlns:vormen", VORMEN_NS);

    const work = doc.createElementNS(CC_NS, "cc:Work");
    work.setAttributeNS(RDF_NS, "rdf:about", "");
    appendDcText(doc, work, "dc:format", "image/svg+xml");
    const type = doc.createElementNS(DC_NS, "dc:type");
    type.setAttributeNS(RDF_NS, "rdf:resource", DCMI_STILL_IMAGE);
    work.appendChild(type);
    if (metadata.title !== "") {
      appendDcText(doc, work, "dc:title", metadata.title);
    }
    if (metadata.description !== "") {
      appendDcText(doc, work, "dc:description", metadata.description);
    }
    if (metadata.author !== "") {
      appendDcText(doc, work, "dc:creator", metadata.author);
    }
    if (metadata.copyright !== "") {
      appendDcText(doc, work, "dc:rights", metadata.copyright);
    }
    if (metadata.date !== null) {
      appendDcText(doc, work, "dc:date", metadata.date.toISOString());
    }
    if (metadata.url !== "") {
      appendDcText(doc, work, "dc:source", metadata.url);
    }
    if (metadata.license !== "") {
      const licenseEl = doc.createElementNS(CC_NS, "cc:license");
      if (/^https?:\/\//.test(metadata.license)) {
        licenseEl.setAttributeNS(RDF_NS, "rdf:resource", metadata.license);
      } else {
        licenseEl.textContent = metadata.license;
      }
      work.appendChild(licenseEl);
    }
    if (metadata.keywords.length > 0) {
      const subject = doc.createElementNS(DC_NS, "dc:subject");
      const bag = doc.createElementNS(RDF_NS, "rdf:Bag");
      for (const keyword of metadata.keywords) {
        const li = doc.createElementNS(RDF_NS, "rdf:li");
        li.textContent = keyword;
        bag.appendChild(li);
      }
      subject.appendChild(bag);
      work.appendChild(subject);
    }
    rdf.appendChild(work);

    if (metadata.settings !== null) {
      const generator = doc.createElementNS(VORMEN_NS, "vormen:generator");
      generator.textContent = JSON.stringify({ settings: metadata.settings });
      rdf.appendChild(generator);
    }
    metadataEl.appendChild(rdf);
  }

  let descEl: Element | null = null;
  if (metadata.description !== "") {
    descEl = doc.createElementNS(SVG_NS, "desc");
    descEl.textContent = metadata.description;
  }

  let titleEl: Element | null = null;
  if (metadata.title !== "") {
    titleEl = doc.createElementNS(SVG_NS, "title");
    titleEl.textContent = metadata.title;
  }

  const first = svgNode.firstChild;
  if (titleEl) {
    svgNode.insertBefore(titleEl, first);
  }
  if (descEl) {
    svgNode.insertBefore(descEl, first);
  }
  if (metadataEl) {
    svgNode.insertBefore(metadataEl, first);
  }
}

/**
 * Append a Dublin Core text element, e.g. `<dc:title>value</dc:title>`, to a
 * parent element.
 */
function appendDcText(
  doc: Document,
  parent: Element,
  name: string,
  value: string,
): void {
  const el = doc.createElementNS(DC_NS, name);
  el.textContent = value;
  parent.appendChild(el);
}
