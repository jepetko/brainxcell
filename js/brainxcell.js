/**
 * brainxcell DSL
 * author: K. Golbang
 *
 * brainxcell is an easy way to build mindmaps using a javascript DSL.
 */
var brainxcell = (function($) {

    function Utils() {};
    /**
     * prototypal inheritance
     *
     * @param parent Function; parent class
     * @param child Function; child class
     * @return {*} child class
     */
    Utils.extends = function(parent,child) {
        child.prototype = new parent();
        child.prototype.constructor = child;
        return child;
    }
    /**
     *
     * @param parents Array(Function); parent class
     * @param child Object; the target object the capabilities of the parent class should be mixed in
     * @return {*} child object
     */
    Utils.mix = function(parents,child) {
        for( var i=0;i<parents.length;i++ ) {
            var parent = parents[i];
            var p = new parent();
            for( var key in p ) {
                child[key] = p[key];
            }
        }
        return child;
    }

    function Configurable(cfg) {
        this.init = function(cfg){
            if(!cfg) return;
            for(var key in cfg) {
                this[key] = cfg[key];
            }
        }
        this.init(cfg);
    }

    function Renderer(tgt) {
        this.tgt = tgt;
        this.totalDepth = 1;
        this.simulation = [];

        this.half = function(val) {
            if(!$.isNumeric(val))
                return null;
            return Math.round(val/2);
        }

        this.relLeft = function(node,nodeDepth) {
            var parentRes = node.parent.getRes();
            var totalWidth = this.tgt.outerWidth();

            var res = node.getRes();
            var width = res.outerWidth();

            var delta = this.half(totalWidth)/this.totalDepth*nodeDepth-this.half(width);
            return delta;
        }

        this.relTop = function(node,nodeDepth) {
            var parentRes = node.parent.getRes();
            var totalHeight = this.tgt.outerWidth();

            var res = node.getRes();
            var height = res.outerHeight();

            var parts = node.parent.children.length * this.totalDepth;
            var childRank = (nodeDepth-1) * (node.childIndex+1);
            var delta = this.half(totalHeight)/parts*childRank-this.half(height);
            return delta;
        }

        this.renderRoot = function(node) {
            return $.proxy( (function(node) {
                return function() {
                    var w = this.tgt.width();
                    var h = this.tgt.height();
                    var pos = { top : this.half(h), left : this.half(w) };
                    var tpl = this.getNodeTpl(node);

                    this.tgt.append(tpl);
                    var res = this.tgt.children(this.getNodeTplId(node,true));

                    var elWidth = res.width(), elHeight = res.height();
                    pos.left -= this.half(elWidth);
                    pos.top -= this.half(elHeight);

                    res.css('top', pos.top + 'px');
                    res.css('left', pos.left + 'px');
                    node.setRes(res);
                }
            })(node), this);
        }

        this.renderNode = function(node,nodeDepth) {
            return $.proxy( (function(node) {
                return function() {
                    var parentRes = node.parent.getRes();

                    var tpl = this.getNodeTpl(node);
                    this.tgt.append(tpl);

                    var res = this.tgt.children(this.getNodeTplId(node,true));
                    node.setRes(res);
                    res.css('top', parentRes.css("top"));
                    res.css('left', parentRes.css("left"));
                    var width = this.relLeft(node,nodeDepth);
                    var height = this.relTop(node,nodeDepth);

                    res.animate( {  "left" : "+=" + width + "px",
                                    "top" : height + "px" }, "slow" );
                }
            })(node), this);
        }

        this.render = function(node,nodeDepth) {
            if(!node.id)
                return null;

            if( typeof nodeDepth === 'undefined' )
                nodeDepth = 1;
            else
                ++nodeDepth;

            var f = null;
            if( node.isRoot() ) {
                this.totalDepth = node.getDepth();
                f = this.renderRoot(node);
            } else {
                f = this.renderNode(node,nodeDepth);
            }
            this.simulation.push(f);

            if(node.hasChildren()) {
                var ch = node.children;
                for(var i=0;i<ch.length;i++)
                    this.render(ch[i],nodeDepth);
            }
        }
        this.play = function(node) {
            this.render(node);
            /*
            for(var i=0;i<this.simulation.length;i++) {
                var prev = this.simulation[i];
                $.when( prev.call(null)).done( console.log('done') );
            }*/

            for( var i=0; i<this.simulation.length; i++ ) {
                var sim = this.simulation[i];
                $(this).queue( (function(t,sim) {
                    return function() {
                        $.when( sim.call(null)).done( (function(t) {
                            return function() {
                                $(t).dequeue();
                            }
                        })(t) );
                    }
                })(this,sim) );
            }
        }
        this.getNodeTplId = function(node, as$Sel) {
            var id = as$Sel ? '#' : '';
            id += "node-" + node.id;
            return id;
        }
        this.getConnTplId = function(fromNode, toNode, as$Sel) {
            var id = as$Sel ? '#' : '';
            id += "conn-" + fromNode.id + "-" + toNode.id;
            return id;
        }
        this.getNodeTpl = function(node) {
            return '<div class="brainxcell brainxcell-node" id="' + this.getNodeTplId(node,false) + '">'
                    + (node.desc || node.id) + '</div>';
        }
        this.getConnectTpl = function(fromNode, toNode) {
            return '<div class="brainxcell brainxcell-conn" id="' + this.getConnTplId(fromNode,toNode,false) + '"/>';
        }
    }

    function Node(cfg) {
        Utils.mix([Configurable],this);
        this.id = 'nameless';
        this.desc = null;
        this.res = null;
        this.init(cfg);

        this.setRes = function(res) {
            this.res = res;
        }
        this.getRes = function() {
            return this.res;
        }
        this.play = function(tgt) {
            var renderer = new Renderer(tgt);
            renderer.play(this);
        }
    }

    function Branch(parent,cfg) {
        this.children = [];
        this.parent = parent;
        this.childIndex = 0;
        this.branch = function(cfg) {
            for(var i=0;i<this.children.length;i++) {
                var ch = this.children[i];
                if(ch.id === cfg.id)
                    return ch;
            }
            var b = new Branch(this,cfg);
            b.childIndex = this.children.length;
            this.children.push(b);
            return b;
        }
        this.hasChildren = function() {
            return this.children && this.children.length>0;
        }
        this.isRoot = function() {
            return (this.parent == null);
        }
        this.getDepth = function() {
            var depth = 1;
            if( this.hasChildren() ) {
                var max = 0;
                for(var i=0; i<this.children.length; i++ ) {
                    var ch = this.children[i];
                    var d = ch.getDepth();
                    if( max == null ) {
                        max = ch;
                    } else {
                        if(d > max)
                            max = d;
                    }
                }
                depth += max;
            }
            return depth;
        }
        this.init(cfg);
    }

    function Root(cfg) {
        this.init(cfg);
    }

    Utils.extends(Node,Branch);
    Utils.extends(Branch,Root);

    return {
        createRoot : function(cfg) {
            if(!this.root)
                this.root = new Root(cfg);
            return this.root;
        },
        root : null
    };

})(jQuery);


function root(cfg) {
    var b = brainxcell;
    if(!b)
        return null;
    return b.createRoot(cfg);
}

/*
root({desc : 'root'}).branch('branch_0').branch('branch_0_0').branch('branch_0_1').leaf();
root().branch('branch_0').branch('branch_1_0').branch('branch_1_1').leaf();
root().branch('branch_1').branch('branch_1_0').branch('branch_1_1').leaf();
root().start(tgt);
*/

/*
//alternative:
root( 'root', function() {
    branch( 'name', function() {
        branch( 'name', function() {
            branch( 'name', function() {
                leaf();
                leaf();
                leaf();

            })
        })
    })
});*/