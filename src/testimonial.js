// Testimonial Carousel (React)
const testimonials = [
  {
    name: "Emily R.",
    img: "https://randomuser.me/api/portraits/women/44.jpg",
    review: "CBMS made our project management seamless and efficient! Highly recommended.",
  },
  {
    name: "Michael T.",
    img: "https://randomuser.me/api/portraits/men/32.jpg",
    review: "The mobile app is a game changer for our on-site teams.",
  },
  {
    name: "Sofia L.",
    img: "https://randomuser.me/api/portraits/women/65.jpg",
    review: "Excellent support and easy-to-use interface.",
  },
];
function TestimonialCarousel() {
  const [index, setIndex] = React.useState(0);
  React.useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % testimonials.length), 4000);
    return () => clearInterval(timer);
  }, []);
  const t = testimonials[index];
  return (
    React.createElement('div', {className: "d-flex flex-column align-items-center justify-content-center", style: {minHeight:'340px'}},
      React.createElement('div', {
        style: {
          background: 'linear-gradient(120deg, rgba(0,223,216,0.18) 0%, rgba(0,124,240,0.18) 100%)',
          borderRadius: '2rem',
          boxShadow: '0 8px 32px rgba(0,124,240,0.10)',
          padding: '2.5rem 2rem 2rem 2rem',
          maxWidth: 420,
          width: '100%',
          position: 'relative',
          backdropFilter: 'blur(8px)',
          border: '1.5px solid rgba(0,124,240,0.10)',
          transition: 'box-shadow 0.3s',
          animation: 'fadeIn 0.7s',
        }
      },
        React.createElement('i', {className: "bi bi-quote display-3 text-primary position-absolute", style: {top:20,left:30,opacity:0.15}}),
        React.createElement('img', {src: t.img, alt: t.name, className: "testimonial-img mb-3 shadow", style: {border:'3px solid #007cf0'}}),
        React.createElement('blockquote', {className: "blockquote text-center"},
          React.createElement('p', {className: "mb-2", style: {fontSize:'1.2rem',fontWeight:500}}, `“${t.review}”`),
          React.createElement('footer', {className: "blockquote-footer", style: {fontWeight:700, color:'#007cf0'}}, t.name)
        ),
        React.createElement('div', {className: "mt-3"},
          testimonials.map((_, i) =>
            React.createElement('span', {
              key: i,
              className: "mx-1 badge rounded-pill " + (i === index ? "bg-primary" : "bg-secondary"),
              style: {width:12,height:12,display:'inline-block'}
            }, '\u00A0')
          )
        ),
        React.createElement('style', null, `@keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }`)
      )
    )
  );
}
if (window.React && window.ReactDOM && document.getElementById('testimonial-carousel-root')) {
  ReactDOM.render(React.createElement(TestimonialCarousel), document.getElementById('testimonial-carousel-root'));
}
