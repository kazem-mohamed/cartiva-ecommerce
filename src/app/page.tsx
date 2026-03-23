import HomeCategories from '@/component/home/homeCategories'
import MainSlider from '@/component/home/MainSlider'
import Sale from '@/component/home/Sale'
import Sec2 from '@/component/home/sec2'
import ProductHome from './ProductHome'
import ContactHome from '@/component/home/ContactHome'

export default function Homepage() {
  return (
    <>
    {/* main slider */}
    <MainSlider />

    {/* sections 2 */}
    <Sec2/>
    {/* categories */}
    <HomeCategories />
    {/* sale section */}
    <Sale />
    {/* products */}
    <ProductHome />
    {/* contact */}
    <ContactHome />
    </>
  )
}
