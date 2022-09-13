import Header from '~/components/primitives/Header'
import { serialize } from 'next-mdx-remote/serialize'
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { MDXRemote } from 'next-mdx-remote'
import rehypeAutoLinkHeadings from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'
import * as components from '~/components/mdx'

export default function Guide({ fathom, data }) {
  return (
    <>
      <Header fathom={fathom} />
      <div className="py-2 flex flex-col gap-8 justify-center items-center mx-auto text-center -mt-20">
        <h1 className="text-6xl font-bold mb-4">Guide</h1>
        <div className="flex flex-row gap-4 justify-center items-center">
          <a href="#setup" className="button">
            Setup
          </a>
          <a href="#faq" className="button bg-opacity-50">
            FAQ
          </a>
        </div>

        {data.map((d, i) => [
          <div className="prose" key={d.frontmatter.title}>
            <div className={`item ${d.frontmatter.title.toLowerCase().replace(/\s/g, '-').replace(/\?/g, '')}`}>
              <MDXRemote {...d} components={components} />
            </div>
          </div>,
          i === 0 ? (
            <div className="prose -mb-5" key="faq-title">
              <h1>
                <a id="faq" href="#faq">
                  FAQ
                </a>
              </h1>
            </div>
          ) : null,
        ])}
        <h3 className="text-2xl font-bold">More to come</h3>
      </div>
    </>
  )
}

export async function getStaticProps() {
  const rootDir = join(process.cwd(), 'src', 'pages', 'guide-parts')
  const files = await readdir(rootDir)
  const fileInfo = await Promise.all(files.map((f) => readFile(join(rootDir, f), 'utf-8')))
  const data = await Promise.all(
    fileInfo.map((content) =>
      serialize(content, {
        parseFrontmatter: true,
        mdxOptions: { rehypePlugins: [rehypeSlug, [rehypeAutoLinkHeadings, { behavior: 'wrap' }]] },
      })
    )
  )
  return { props: { data } }
}
