import { Link } from "react-router-dom";

function FooterLinks() {
    const linkClasses = "font-sans text-base font-semibold text-white no-underline transition-colors duration-300 hover:text-[#FF8C00]";

    return (
        <div className="flex gap-16 flex-wrap">
            <div className="min-w-[120px]">
                <h3 className="font-mono text-[0.9rem] font-normal text-[#888888] mb-4 capitalize">Navigate</h3>
                <ul className="list-none p-0 m-0">
                    <li className="mb-3">
                        <Link to="/" className={linkClasses}>Home</Link>
                    </li>
                    <li className="mb-3">
                        <Link to="/about-section" className={linkClasses}>About Us</Link>
                    </li>
                    <li className="mb-3">
                        <Link to="/how-it-works" className={linkClasses}>How it Works</Link>
                    </li>
                    <li className="mb-3">
                        <Link to="/features" className={linkClasses}>Features</Link>
                    </li>
                </ul>
            </div>
            <div className="min-w-[120px]">
                <h3 className="font-mono text-[0.9rem] font-normal text-[#888888] mb-4 capitalize">Socials</h3>
                <ul className="list-none p-0 m-0">
                    <li className="mb-3">
                        <a href="#" className={linkClasses}>Twitter [X]</a>
                    </li>
                    <li className="mb-3">
                        <a href="#" className={linkClasses}>Instagram</a>
                    </li>
                    <li className="mb-3">
                        <a href="#" className={linkClasses}>Facebook</a>
                    </li>
                    <li className="mb-3">
                        <a href="#" className={linkClasses}>LinkedIn</a>
                    </li>
                </ul>
            </div>
            <div className="min-w-[120px]">
                <h3 className="font-mono text-[0.9rem] font-normal text-[#888888] mb-4 capitalize">Contacts</h3>
                <ul className="list-none p-0 m-0">
                    <li className="mb-3">
                        <a href="mailto:rihla@gmail.ma" className={linkClasses}>rihla@gmail.ma</a>
                    </li>
                    <li className="mb-3">
                        <a href="tel:+212000000000" className={linkClasses}>+212 000 000 000</a>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default FooterLinks;