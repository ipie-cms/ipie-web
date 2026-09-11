import Header from "./components/Header/Header";
import Banner from './components/Banner/Banner';
import Pillars from './components/Pillars/Pillars';
import InsolvencyMap from './components/InsolvencyMap/InsolvencyMap';
import About from './components/About/About';
import Services from './components/Services/Services';
import ProcessSection from './components/ProcessSection/ProcessSection';
import WhatsNew from "./components/WhatsNew/WhatsNew";
import FAQ from "./components/FAQs/FAQs";
import Footer from "./components/Footer/Footer";

function App() {
  return (
    <div className="w-full min-h-screen bg-white font-sans text-slate-900 antialiased overflow-x-clip">
      
      {/* Header – main ke bahar (sticky/fixed safe rahega) */}
      <Header />

      {/* ✅ Saare content sections ek common <main> container me */}
      <main className="w-full ">
        {/* Banner with Stats */}
        <Banner />
        <Pillars />
        <InsolvencyMap />
        <About />
        <Services />
        <ProcessSection />
        <WhatsNew />
        <FAQ />
      </main>

      {/* Footer – bhi main ke bahar (semantic structure) */}
      <Footer />
    </div>
  );
}

export default App;