import { routeChange } from "./router/router.js";
import { setItem, getItem } from "./storage/storage.js";

export default function SelectedOptions({ $target, initialState }) {
    const $component = document.createElement('div');
    $target.appendChild($component);

    this.state = initialState;

    this.setState = (nextState) => {
        this.state = nextState;
        this.render();
    }

    this.render = () => {
        const { product, selectedOptions = [] } = this.state;
        if(product && selectedOptions) {
            $component.innerHTML = `
                <h3>선택된 상품</h3>
                <ul>
                    ${selectedOptions.map(selectedOption => `
                        <li>
                            ${selectedOption.optionName} ${product.price + selectedOption.optionPrice}원
                            <input type='text' data-option-id='${selectedOption.optionId}' value='${selectedOption.quantity}'
                        </li>
                    `).join('')}
                </ul>
                <div class='ProductDetail__totalPrice'>${this.getTotalPrice()}원</div>
                <button class='OrderButton'>주문하기</button>
            `
        }
    }

    this.getTotalPrice = () => {
        const { product, selectedOptions } = this.state;
        const { price: productPrice } = product;

        return selectedOptions.reduce((acc, option) => acc + ((productPrice + option.optionPrice) * option.quantity), 0)
    }

    $component.addEventListener('change', (e) => {
        if(e.target.tagName === 'INPUT') {
            try {
                const nextQuantity = parseInt(e.target.value);
                const nextSelectedOptions = [...this.state.selectedOptions];

                if(typeof nextQuantity === 'number') {
                    const { product } = this.state;
                    const optionId = parseInt(e.target.dataset.optionId);
                    const option = product.productOptions.find(option => option.id === optionId);
                    const selectedOptionIndex = nextSelectedOptions.findIndex(selectedOption => selectedOption.optionId === optionId);
                    
                    nextSelectedOptions[selectedOptionIndex].quantity = option.stock >= nextQuantity ? nextQuantity : option.stock;

                    this.setState({
                        ...this.state,
                        selectedOptions: nextSelectedOptions
                    })
                }

            } catch(e) {
                console.log(e);
            }
        }
    })

    $component.addEventListener('click', (e) => {
        const { selectedOptions } = this.state;
        if(e.target.className === 'OrderButton') {
            const cartData = getItem('products_cart', [])
            setItem('products_cart', cartData.concat(selectedOptions.map(selectedOption => ({
                productId: selectedOption.productId,
                optionsId: selectedOption.optionId,
                quantity: selectedOption.quantity,
            }))))

            routeChange('/cart');
        }
    })

    this.render();
}