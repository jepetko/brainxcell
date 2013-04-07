/**
 * brainxcell DSL
 * author: K. Golbang
 *
 * brainxcell is an easy way to build mainmaps using a javascript DSL.
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

    function Renderable() {
        this.render = function(tgt,pos) {
            if(!this.id)
                return null;

            if( !pos ) {
                pos = {};
                var w = tgt.width();
                console.log(w);
                var h = tgt.height();
                console.log(h);
                pos.top = Math.round(w/2);
                pos.left = Math.round(h/2);
            }

            var tpl = this.getNodeTpl();
            tgt.append(tpl);
            var res = tgt.children(this.getNodeTplId(true));

            res.css('top', pos.top + 'px');
            res.css('left', pos.left + 'px');
            res.css('visibility', 'visible');
        }
        this.getNodeTplId = function(asJQuerySel) {
            var id = asJQuerySel ? '#' : '';
            id += "node-" + this.id;
            return id;
        }
        this.getNodeTpl = function() {
            return '<div class="brainxcell brainxcell-node" style="visibility:hidden;" id="' + this.getNodeTplId(false) + '">'
                    + this.desc + '</div>';
        }
        this.getConnectTpl = function(to) {
            return '<div class="brainxcell brainxcell-conn" id="conn-"' + this.id + "-" + to.id + '"/>';
        }
    }

    function Node(cfg) {
        Utils.mix([Configurable,Renderable],this);
        this.id = 'nameless';
        this.desc = 'TODO: description';
        this.init(cfg);
    }

    function Branch(cfg) {
        this.children = [];
        this.branch = function(cfg) {
            for(var i=0;i<this.children.length;i++) {
                var ch = this.children[i];
                if(ch.id === cfg.id)
                    return ch;
            }
            var b = new Branch(cfg);
            this.children.push(b);
            return b;
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