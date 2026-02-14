import HomeHeader from "./components/HomeHeader";
import HomeFooter from "./components/HomeFooter";

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="h-full">
            <HomeHeader />
            <main className="h-full pt-20">{children}</main>
            <HomeFooter />
        </div>
    );
};
export default LandingLayout;
