import img_table from '../assets/table 1.jpg';
import img_bathtub from '../assets/product3.jpg';
import img_desk from '../assets/product4.jpg';
import img_kitchen from '../assets/product7.jpg';

export const BLOG_ARTICLES = [
  {
    id: 1,
    slug: 'in-the-heart-of-valencia',
    title: 'In the heart of Valencia',
    category: 'Decoration',
    date: '26 May 2023',
    author: 'Mr. Mackay',
    comments: 1,
    excerpt: 'As an alternative theory, and because Latin scholars do this sort of thing, discovering authentic Mediterranean interior trends...',
    content: `Valencia is famous for its harmonious blend of historic Moorish influences and sleek contemporary European architecture. In modern apartment renovations across the city, raw pine, oiled oak, and handcrafted ceramics dominate the visual landscape.

Interior designers emphasize natural airflow and high-contrast wooden accents. Choosing minimalist silhouettes allows timber textures to radiate warmth without cluttering the spatial volume.`,
    img: img_table,
    tags: ['Interior Design', 'Mediterranean', 'Decor']
  },
  {
    id: 2,
    slug: 'ethimo-mountain-style',
    title: 'Ethimo mountain style',
    category: 'Furniture',
    date: '09 May 2023',
    author: 'Mr. Mackay',
    comments: 0,
    excerpt: 'Bringing alpine warmth and refined timber elegance into contemporary urban residences.',
    content: `Mountain and lodge styling has evolved far beyond heavy, rustic log cabins. Modern alpine design incorporates refined slatted teak, brushed aluminum hardware, and neutral wool upholstery.

By prioritizing ergonomic geometry and weather-resistant finishes, furniture pieces effortlessly transition from indoor sunrooms to open-air verandas.`,
    img: img_bathtub,
    tags: ['Alpine', 'Furniture', 'Trends']
  },
  {
    id: 3,
    slug: 'for-clear-thinking',
    title: 'For clear thinking',
    category: 'Wooden accessories',
    date: '30 Apr 2023',
    author: 'Mr. Mackay',
    comments: 1,
    excerpt: 'How ergonomic wooden workspaces and minimalist desk organizers foster productivity and mental clarity.',
    content: `A cluttered workspace directly impacts cognitive load and focus. By selecting acoustic wooden desk panels, cable-concealing desktop trays, and solid walnut accessories, your workstation becomes a calm sanctuary for deep work.`,
    img: img_desk,
    tags: ['Workspace', 'Ergonomics', 'Oak']
  },
  {
    id: 4,
    slug: 'the-clean-series',
    title: 'The clean series',
    category: 'Design trends',
    date: '18 Apr 2023',
    author: 'Mr. Mackay',
    comments: 0,
    excerpt: 'Exploring the understated mastery of clean lines, concealed joints, and organic wood finishes.',
    content: `Minimalism is not about empty rooms—it is about intentionality. The Clean Series highlights handcrafted joinery techniques that eliminate visible fasteners, creating unbroken linear silhouettes that celebrate the natural grain of premium ash and birch.`,
    img: img_kitchen,
    tags: ['Minimalism', 'Kitchen', 'Modern']
  },
];

export const findArticleBySlugOrId = (identifier) => {
  if (!identifier) return null;
  const target = String(identifier).toLowerCase().trim();
  return BLOG_ARTICLES.find(a => 
    String(a.id) === target || 
    a.slug === target ||
    a.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === target
  ) || null;
};
