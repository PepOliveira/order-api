const Order = require("../models/orderModel")

// Criar pedido
exports.createOrder = async (req, res) => {

    try {

        const body = req.body

        // mapping dos campos
        const order = new Order({
            orderId: body.numeroPedido,
            value: body.valorTotal,
            creationDate: body.dataCriacao,
            items: body.items.map(item => ({
                productId: Number(item.idItem),
                quantity: item.quantidadeItem,
                price: item.valorItem
            }))
        })

        await order.save()

        res.status(201).json(order)

    } catch (error) {

        res.status(500).json({
            message: "Erro ao criar pedido",
            error: error.message
        })
    }
}

// Buscar pedido
exports.getOrder = async (req, res) => {

    try {

        const order = await Order.findOne({
            orderId: req.params.orderId
        })

        if (!order) {
            return res.status(404).json({
                message: "Pedido não encontrado"
            })
        }

        res.json(order)

    } catch (error) {

        res.status(500).json({
            message: error.message
        })
    }
}

// Listar pedidos
exports.listOrders = async (req, res) => {

    try {

        const orders = await Order.find()

        res.json(orders)

    } catch (error) {

        res.status(500).json({
            message: error.message
        })
    }
}



// Atualizar pedido
exports.updateOrder = async (req, res) => {

  try {

    const body = req.body

    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      {
        orderId: body.numeroPedido,
        value: body.valorTotal,
        creationDate: body.dataCriacao,
        items: body.items.map(item => ({
          productId: Number(item.idItem),
          quantity: item.quantidadeItem,
          price: item.valorItem
        }))
      },
      { new: true }
    )

    if (!order) {
      return res.status(404).json({
        message: "Pedido não encontrado"
      })
    }

    res.json(order)

  } catch (error) {

    console.error(error)

    res.status(500).json({
      message: "Erro ao atualizar pedido",
      error: error.message
    })
  }
}

// Deletar pedido
exports.deleteOrder = async (req, res) => {

    try {

        const order = await Order.findOneAndDelete({
            orderId: req.params.orderId
        })

        if (!order) {
            return res.status(404).json({
                message: "Pedido não encontrado"
            })
        }

        res.json({
            message: "Pedido deletado com sucesso"
        })

    } catch (error) {

        res.status(500).json({
            message: error.message
        })
    }
}

